# 2:22 DFIR Framework — OpenAI LLM Client
# Uses the OpenAI Responses API for narrative generation
# Falls back to deterministic template-based narrative if unavailable

import os
from dotenv import load_dotenv

load_dotenv()

_CLIENT = None
_AVAILABLE = None


def _check_availability():
    global _CLIENT, _AVAILABLE
    if _AVAILABLE is not None:
        return _AVAILABLE

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "optional" or len(api_key) < 10:
        _AVAILABLE = False
        return False

    try:
        from openai import OpenAI
        _CLIENT = OpenAI(api_key=api_key)
        _AVAILABLE = True
    except ImportError:
        print("[WARN] openai package not installed — LLM narrative disabled")
        _AVAILABLE = False
    except Exception as e:
        print(f"[WARN] OpenAI client init failed: {e}")
        _AVAILABLE = False

    return _AVAILABLE


class OpenAILLMClient:
    def __init__(self):
        self.available = _check_availability()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.15"))
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))

    def is_available(self) -> bool:
        return self.available

    def generate(self, prompt: str) -> str:
        if not self.available:
            return "[LLM unavailable] Narrative generation skipped."

        try:
            kwargs = {
                "model": self.model,
                "input": prompt,
                "max_output_tokens": self.max_tokens,
            }
            # Temperature not supported on all models
            if not self.model.startswith("gpt-5"):
                kwargs["temperature"] = self.temperature

            response = _CLIENT.responses.create(**kwargs)
            return response.output_text
        except Exception as e:
            print(f"[WARN] OpenAI generation failed: {e}")
            return f"[LLM error] Narrative generation failed: {str(e)[:200]}"
