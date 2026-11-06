"""HeyBuddy local API foundation.

This skeleton deliberately does not capture screens or audio and does not
perform harm classification. Ollama integration will be added in Step 3.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HeyBuddy Local API",
    description="Local-only foundation for the HeyBuddy safety assistant.",
    version="0.1.0",
)

# The UI runs from Vite on the same machine. Never expose this service publicly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    """Report whether the local API is running."""
    return {"status": "ok", "service": "heybuddy-api", "version": "0.1.0"}


@app.get("/api/features")
def features() -> dict[str, object]:
    """Document what is and is not available in this initial build."""
    return {
        "local_api": True,
        "ollama_analysis": False,
        "screen_capture": False,
        "microphone": False,
        "wake_word": False,
        "elevenlabs": False,
        "note": "The safety scenarios shown in the UI are prewritten demos.",
    }
