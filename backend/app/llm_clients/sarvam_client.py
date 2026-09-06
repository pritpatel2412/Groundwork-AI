import os
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

class SarvamClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or SARVAM_API_KEY
        self.base_url = "https://api.sarvam.ai"

    def _headers(self) -> Dict[str, str]:
        return {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

    def speech_to_text(self, audio_bytes: bytes, filename: str = "audio.wav", language_code: str = "hi-IN") -> Dict[str, Any]:
        """
        Saaras STT: Transcribes audio in 22 Indian languages plus code-mixed speech (e.g. Hinglish).
        """
        if not self.api_key:
            return {"transcript": "[Sarvam API Key not configured]", "language": language_code}

        url = f"{self.base_url}/speech-to-text"
        headers = {"api-subscription-key": self.api_key}
        files = {
            "file": (filename, audio_bytes, "audio/wav")
        }
        data = {
            "model": "saaras:v1",
            "language_code": language_code
        }
        try:
            resp = requests.post(url, headers=headers, files=files, data=data, timeout=30)
            if resp.status_code == 200:
                return resp.json()
            else:
                return {"transcript": "", "error": f"Sarvam STT failed: {resp.status_code} - {resp.text}"}
        except Exception as e:
            return {"transcript": "", "error": str(e)}

    def translate(
        self,
        text: str,
        target_language_code: str = "hi-IN",
        source_language_code: str = "en-IN",
        mode: str = "formal"
    ) -> str:
        """
        Sarvam Translate (Mayura model): Translates generated requirements or artifacts on demand.
        """
        if not self.api_key or not text.strip():
            return text

        url = f"{self.base_url}/translate"
        payload = {
            "input": text,
            "source_language_code": source_language_code,
            "target_language_code": target_language_code,
            "speaker_gender": "Female",
            "mode": mode,
            "model": "mayura:v1"
        }
        try:
            resp = requests.post(url, headers=self._headers(), json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("translated_text", text)
            else:
                print(f"[SarvamClient] Translate error {resp.status_code}: {resp.text}")
                return text
        except Exception as e:
            print(f"[SarvamClient] Translate exception: {e}")
            return text

sarvam_client = SarvamClient()
