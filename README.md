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

## Desktop mascot update

HeyBuddy now shows an original cartoon mouse with large round ears. **Drag the character itself** to move its floating window; use **Open HeyBuddy** beneath the character to open the dashboard, or **×** to hide it. The dashboard uses the same mascot.

The character is an original mouse design inspired by classic animation, **not an official Disney/Mickey Mouse asset**. Do not use an unlicensed character likeness or cloned actor voice in a public release.


## Step 3 — Live, opt-in conversation scanning (local)

HeyBuddy can now **read visible conversation text without uploading screenshots manually**.

Install [Ollama](https://ollama.com/download) on your own Windows PC and run:

```powershell
ollama pull gemma3:4b
```

In one PowerShell terminal in the project root run:

```powershell
python -m pip install -r apps/api/requirements.txt
npm run start:api
```

In another PowerShell terminal run:

```powershell
npm install
npm run dev
```

Open **Safety preview** in the HeyBuddy dashboard. Select a chat window or screen under **Screen Protection**, then click **Start screen protection**. Stop sharing when finished. The app samples the visible image approximately every 15 seconds (only while enabled), sends the frame to FastAPI on localhost and analyses it with your local Ollama vision model. It shows explanations and warning signs but does not claim certainty.

This version **does not record or understand voice messages** and does not automatically access the microphone. Voice-message transcription requires an additional, consent-based local system-audio capture pipeline. No images are written to disk by HeyBuddy, and there is no cloud analysis in this feature. Do not screen-share private chats you lack permission to process. The repository remains public; never commit personal messages or recordings.

## Demo chat environment

A fictional test chat is available through the **Open demo chat** button in **Safety preview → Screen Protection**. It opens a separate Electron window. You can also open http://127.0.0.1:5173/demo.html in a regular browser while Vite is running.

Scenarios: reward scam, grooming warning signs, cyberbullying and harmless school conversation. In the dashboard, refresh the screen source list, select **HeyBuddy Fictional Chat Lab**, then click **Start screen protection**. Wait for a complete local model assessment and switch scenarios to compare outputs. You must start screen capture explicitly. Nothing records in the background when sharing is off.

## Screen protection capture troubleshooting

If **Start screen protection** is greyed out: first click **Open demo chat**, then
**Refresh windows**, choose **HeyBuddy Fictional Chat Lab**, and allow the source
approval to complete. The status will say *Window approved*. Then click Start.

If capture is denied, HeyBuddy now displays an explicit error and asks you to
re-select the source. Only the desktop application can use the Electron custom
source picker. In a standalone web browser use its native screen-sharing picker.
The Electron main process logs capture denials in the terminal. Only the
explicitly selected screen/window is eligible; audio capture remains disabled.

This change updates code, but successful Windows screen-capture operation still
requires a real local test.
