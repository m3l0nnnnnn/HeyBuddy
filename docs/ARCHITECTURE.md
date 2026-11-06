# HeyBuddy architecture — initial skeleton

## Design goal

A friendly local-first AI companion that *helps people recognise possible signs of online harm* while they browse. Classification must be treated as uncertain guidance, not definitive evidence of a crime or abusive intent.

## Current components

- **apps/web**: React/Vite user interface. Displays a CSS-drawn original character, navigation, three fully fictional scenarios with *prewritten* teaching explanations, and a local backend status panel.
- **apps/desktop**: Electron desktop shell hosting the web interface. **No floating overlay, screen capture, or microphone permissions yet.**
- **apps/api**: FastAPI local service restricted to 127.0.0.1. Exposes GET /health and GET /api/features. **No model calls yet.**

## Planned next steps

1. Ollama local model (structured, evidence-based text analysis). Require the model to label uncertainty and quote only the user-provided material.
2. Explicit user-consented screen/window capture with visible pause and stop. Treat images and messages as untrusted input, never instructions.
3. Offline speech-to-text, then optional wake-word detection. Default to no microphone access.
4. Floating Buddy overlay and local text-to-speech. ElevenLabs optional only for approved, non-sensitive demonstrations.

## Security model

- Never give an LLM shell, filesystem, browser automation, credential or unrestricted network tools.
- Never scrape conversations or record audio by default.
- Never save user-provided screenshots/messages unless they explicitly request it.
- Keep the analysis backend bound to localhost; no open CORS wildcards.
- Do not send sensitive material about minors or third parties to cloud services by default.
- Clearly distinguish a fictional educational preview from real model-generated output.
- Offer practical protective actions and trusted support pathways without claiming to diagnose people.
