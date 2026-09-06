import os
import time
import json
import hashlib
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")

# Configure clients using OpenAI-compatible endpoints
GROQ_CLIENT = OpenAI(
    api_key=GROQ_API_KEY or "dummy_groq",
    base_url="https://api.groq.com/openai/v1"
) if GROQ_API_KEY else None

NVIDIA_CLIENT = OpenAI(
    api_key=NVIDIA_API_KEY or "dummy_nvidia",
    base_url="https://integrate.api.nvidia.com/v1"
) if NVIDIA_API_KEY else None

# Active models confirmed on the user's free tier
GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
NVIDIA_VERIFIER_MODELS = ["nvidia/nemotron-3-super-120b-a12b", "meta/llama-3.2-11b-vision-instruct"]

# Simple in-memory response cache to preserve free-tier quota (BUILD_BRIEF.md §7, §8)
_CACHE: Dict[str, str] = {}
CACHE_DIR = os.path.join(os.path.dirname(__file__), ".cache")
os.makedirs(CACHE_DIR, exist_ok=True)

def _get_cache_key(messages: List[Dict[str, str]], purpose: str, model: str) -> str:
    content = json.dumps({"purpose": purpose, "model": model, "messages": messages}, sort_keys=True)
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def _check_disk_cache(key: str) -> Optional[str]:
    if key in _CACHE:
        return _CACHE[key]
    cache_path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _CACHE[key] = data["response"]
                return data["response"]
        except Exception:
            pass
    return None

def _write_disk_cache(key: str, response: str):
    _CACHE[key] = response
    cache_path = os.path.join(CACHE_DIR, f"{key}.json")
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump({"response": response, "time": time.time()}, f)
    except Exception:
        pass

def call_llm(
    messages: List[Dict[str, str]],
    purpose: str = "generate",
    temperature: float = 0.2,
    max_retries: int = 2,
    use_cache: bool = True
) -> str:
    """
    Core LLM router adhering to CLAUDE.md §2, §7 and BUILD_BRIEF.md §4.1:
    - purpose="generate" -> Groq (fast, primary generation)
    - purpose="verify"   -> NVIDIA NIM (independent provider for Verifier agent)
    - Resilient fallback: Groq <-> NVIDIA on 429 rate limit or timeout
    - Disk cache to protect free-tier quotas during demos and testing
    """
    cache_key = _get_cache_key(messages, purpose, "router")
    if use_cache:
        cached = _check_disk_cache(cache_key)
        if cached is not None:
            return cached

    # Determine provider ordering
    groq_tuple = (GROQ_CLIENT, GROQ_MODELS[0]) if GROQ_CLIENT else None
    nvidia_tuple = (NVIDIA_CLIENT, NVIDIA_VERIFIER_MODELS[0]) if NVIDIA_CLIENT else None

    if purpose == "generate":
        # Primary: Groq; Fallback: NVIDIA
        provider_order = [p for p in [groq_tuple, nvidia_tuple] if p is not None]
    else:
        # Primary: NVIDIA (independently-scoped); Fallback: Groq
        provider_order = [p for p in [nvidia_tuple, groq_tuple] if p is not None]

    if not provider_order:
        raise RuntimeError("No LLM client configured. Please check GROQ_API_KEY and NVIDIA_API_KEY in backend/.env")

    last_err = None

    for client, model in provider_order:
        for attempt in range(max_retries):
            try:
                resp = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=2048,
                    timeout=30.0
                )
                text = resp.choices[0].message.content or ""
                if use_cache and text:
                    _write_disk_cache(cache_key, text)
                return text
            except Exception as e:
                last_err = e
                # Respect rate limit retry-after if available
                wait = getattr(e, "retry_after", 2 ** attempt)
                time.sleep(min(wait, 5))

    raise RuntimeError(f"All LLM providers failed for purpose='{purpose}'. Last error: {last_err}")
