# HeyBuddy

**HeyBuddy** is a local-first AI safety companion designed to help young people recognise possible online scams, grooming, cyberbullying, harassment, and manipulation.

## Current status — Step 2: Application skeleton

This repository currently contains the foundations for a React web interface, an Electron desktop shell, and a FastAPI backend. **Harm detection, microphone access, wake-word activation, and screen capture are not implemented yet.** The initial UI is a design prototype; it does not monitor anything.

## Project structure

```text
HeyBuddy/
├── apps/
│   ├── web/       # React + Vite interface, including animated mascot placeholder
│   ├── desktop/   # Electron desktop window
│   └── api/       # Local FastAPI backend
├── docs/
│   └── ARCHITECTURE.md
├── package.json
└── .gitignore
```

## Requirements

- Node.js 20.19+ (or a newer supported LTS version) and npm
- Python 3.10+
- Ollama will be needed in a later step, **not** for running this skeleton

## Start the prototype

1. Clone this repository and run `npm install` in its root.
2. Start the React interface:
   ```bash
   npm run dev:web
   ```
   Open http://127.0.0.1:5173.
3. In another terminal, start the local API:
   ```bash
   cd apps/api
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS / Linux: source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   Verify http://127.0.0.1:8000/health returns a JSON response.
4. In a third terminal, start the Electron desktop shell:
   ```bash
   npm run dev:desktop
   ```

The frontend's status indicator checks the local FastAPI health endpoint. If the backend isn't running, the UI stays usable and reports it as offline.

## Planned milestones

- **Step 2:** Working project skeleton and desktop shell.
- **Step 3:** Ollama local text analysis, with evidence-based and uncertainty-aware results.
- **Step 4:** Explicitly user-initiated screenshots and local vision analysis.
- **Step 5:** Local voice transcription and opt-in wake-word activation.
- **Step 6:** Floating character and optional voice responses.

## Safety and privacy principles

- No hidden or automatic monitoring in the skeleton.
- Capture only content the user explicitly chooses to share.
- Keep safety analysis local by default; do not send private conversations to cloud TTS or STT without informed permission.
- An AI model identifies **possible warning signs**, not proof that an individual is a scammer or groomer.
- Provide supportive guidance and escalation paths; do not claim the AI replaces professional help, platform reporting or emergency services.

The repository is currently **public**. Never commit credentials, real private conversations, screenshots or personal data.

## Step 2b — Floating Buddy

Run `npm install` followed by `npm run dev` from the repository root on Windows. Electron starts the main dashboard and a separate **draggable, always-on-top Buddy avatar** near the bottom-right of your primary display. Drag **Move Buddy** to reposition it. Click Buddy to reopen the dashboard. Click × to hide Buddy; from the desktop app choose **My buddy → Show floating Buddy** to show it again.

This runs in development mode. It does **not** install a Windows desktop shortcut. Screen monitoring, microphone access, voice activation and Ollama are not yet available.
