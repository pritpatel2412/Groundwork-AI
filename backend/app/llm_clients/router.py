import os
import time
import json
import hashlib
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
if os.path.exists(env_path):
    load_dotenv(env_path)
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
GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound", "qwen/qwen3.6-27b"]
NVIDIA_VERIFIER_MODELS = ["nvidia/nemotron-3-super-120b-a12b", "meta/llama-3.2-11b-vision-instruct"]

# Simple in-memory response cache to preserve free-tier quota (BUILD_BRIEF.md §7, §8)
_CACHE: Dict[str, str] = {}
CACHE_DIR = os.path.join(os.path.dirname(__file__), ".cache")
os.makedirs(CACHE_DIR, exist_ok=True)

def _get_cache_key(messages: List[Dict[str, str]], purpose: str, model: str, json_mode: bool = False) -> str:
    content = json.dumps({"purpose": purpose, "model": model, "messages": messages, "json_mode": json_mode}, sort_keys=True)
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def _check_disk_cache(key: str, json_mode: bool = False) -> Optional[str]:
    if key in _CACHE:
        val = _CACHE[key]
        if json_mode:
            try:
                json.loads(val)
                return val
            except Exception:
                _CACHE.pop(key, None)
        else:
            return val

    cache_path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                resp = data.get("response", "")
                if json_mode:
                    try:
                        json.loads(resp)
                    except Exception:
                        try:
                            os.remove(cache_path)
                        except Exception:
                            pass
                        return None
                _CACHE[key] = resp
                return resp
        except Exception:
            pass
    return None

def _write_disk_cache(key: str, response: str, json_mode: bool = False):
    if not response or not response.strip():
        return
    if json_mode:
        try:
            import re
            cleaned = response.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            first_brace = cleaned.find("{")
            last_brace = cleaned.rfind("}")
            if first_brace != -1 and last_brace != -1:
                cleaned = cleaned[first_brace:last_brace + 1]
            cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)
            json.loads(cleaned)
        except Exception:
            # Corrupted or truncated JSON! Never cache it!
            return

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
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_retries: int = 2,
    use_cache: bool = True,
    json_mode: bool = False
) -> str:
    """
    Core LLM router adhering to CLAUDE.md §2, §7 and BUILD_BRIEF.md §4.1:
    - purpose="generate" -> Groq (fast, primary generation)
    - purpose="verify"   -> NVIDIA NIM (independent provider for Verifier agent)
    - json_mode=True     -> passes response_format={'type': 'json_object'} to enforce strict JSON
    - Resilient fallback: Groq <-> NVIDIA on 429 rate limit or timeout
    - Disk cache to protect free-tier quotas during demos and testing
    """
    selected_model_name = model or "router"
    cache_key = _get_cache_key(messages, purpose, selected_model_name, json_mode)
    if use_cache:
        cached = _check_disk_cache(cache_key, json_mode)
        if cached is not None:
            return cached

    # Determine provider ordering
    groq_providers = [(GROQ_CLIENT, m) for m in GROQ_MODELS] if GROQ_CLIENT else []
    nvidia_providers = [(NVIDIA_CLIENT, m) for m in NVIDIA_VERIFIER_MODELS] if NVIDIA_CLIENT else []

    if model:
        # If explicit model requested, route to appropriate client
        if any(prefix in model for prefix in ["meta/", "nvidia/", "deepseek", "mistral"]):
            client = NVIDIA_CLIENT or GROQ_CLIENT
        else:
            client = GROQ_CLIENT or NVIDIA_CLIENT
        provider_order = [(client, model)]
        if purpose == "verify":
            for np in nvidia_providers:
                if np not in provider_order:
                    provider_order.append(np)
            for gp in groq_providers:
                if gp not in provider_order:
                    provider_order.append(gp)
        else:
            for gp in groq_providers:
                if gp not in provider_order:
                    provider_order.append(gp)
            for np in nvidia_providers:
                if np not in provider_order:
                    provider_order.append(np)
    elif purpose == "generate":
        # Primary: Groq; Fallback: NVIDIA
        provider_order = groq_providers + nvidia_providers
    else:
        # Primary: NVIDIA (independently-scoped); Fallback: Groq
        provider_order = nvidia_providers + groq_providers

    if not provider_order:
        raise RuntimeError("No LLM client configured. Please check GROQ_API_KEY and NVIDIA_API_KEY in backend/.env")

    last_err = None

    for client, m_name in provider_order:
        for attempt in range(max_retries):
            try:
                kwargs = {
                    "model": m_name,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 4096,
                    "timeout": 60.0
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                resp = client.chat.completions.create(**kwargs)
                choice = resp.choices[0]
                if choice.finish_reason == "length":
                    raise RuntimeError(f"Model {m_name} output truncated by token limit (finish_reason=length)")
                text = choice.message.content or ""
                if use_cache and text:
                    _write_disk_cache(cache_key, text, json_mode)
                return text
            except Exception as e:
                # If json_mode was rejected by this model/endpoint, attempt without response_format
                if json_mode and "response_format" in str(e).lower():
                    try:
                        kwargs.pop("response_format", None)
                        resp = client.chat.completions.create(**kwargs)
                        choice = resp.choices[0]
                        if choice.finish_reason == "length":
                            raise RuntimeError(f"Model {m_name} output truncated by token limit")
                        text = choice.message.content or ""
                        if use_cache and text:
                            _write_disk_cache(cache_key, text, json_mode)
                        return text
                    except Exception as inner_e:
                        last_err = inner_e
                last_err = e
                # Respect rate limit retry-after if available
                wait = getattr(e, "retry_after", 2 ** attempt)
                time.sleep(min(wait, 5))

    raise RuntimeError(f"All LLM providers failed for purpose='{purpose}'. Last error: {last_err}")
