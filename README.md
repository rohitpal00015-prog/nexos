# Nexora AI — Intelligent Browser Copilot

> **Talk to your browser. Understand the web. Stay productive.**

Nexora AI is a privacy-conscious, AI-powered Chrome browser copilot built with Manifest V3, React, TypeScript, Tailwind CSS, Chrome Side Panel API, and a secure Node.js/Express backend powered by Google Gemini AI.

---

## 1. Problem Statement

Modern web browsing often involves juggling dozens of open tabs, reading length articles, managing multi-task communication on platforms like WhatsApp Web, and dealing with misleading or high-urgency messages. Traditional AI tools exist as isolated chatbots that have no awareness of what you are viewing or doing inside your browser.

## 2. Solution Overview

Nexora AI bridges this gap by acting as a native browser copilot. It reads safe active tab context, parses natural language text or voice instructions through a two-layer command processing architecture, and executes controlled browser actions (tab management, YouTube search, focus session timer, page summarization, WhatsApp reply drafting, and suspicious claim verification).

---

## 3. Key Features

- 💬 **Interactive Sidepanel Copilot**: Natural-language conversational interface embedded directly inside Chrome's Side Panel.
- 🎙️ **Push-to-Talk Voice Controls**: Hands-free voice recognition (Web Speech API) supporting English & Indian English commands with optional SpeechSynthesis spoken answers.
- ⚡ **Two-Layer Command Parser**:
  - **Layer 1 (Local Deterministic Parser)**: Executes instant local commands ("Open YouTube", "Group tabs", "Mute tab", "Start 25 min focus", "Close duplicates") locally without API latency.
  - **Layer 2 (Gemini AI Engine)**: Solves complex queries, generates page summaries, explains selected text, drafts WhatsApp replies, and analyzes claims.
- 📑 **Smart Tab Management**:
  - Domain-based tab grouping (Study, Work, Social, Media, Documentation).
  - Duplicate tab detection with URL normalization (stripping tracking parameters and fragments).
  - Quick tab controls (Mute, Unmute, Refresh, Close).
- 💬 **WhatsApp Web Integration**:
  - Detects active WhatsApp Web chat context.
  - Generates replies tailored to requested tones (*Friendly, Professional, Hinglish, Concise, Polite, Formal*).
  - Inserts drafted replies into the composer **without auto-sending**, leaving the user in 100% control.
- 🛡️ **Suspicious Message & Claim Analysis**: Analyzes text for urgency signals, scam patterns, phishing indicators, and unverified claims with confidence scores and recommended safety steps.
- ⏱️ **Pomodoro Focus Timer**: 25-minute Pomodoro timer backed by `chrome.alarms` and `chrome.storage.local` that survives side-panel closures.
- 🔒 **Privacy & Security First**: Action allowlisting (`ALLOWED_ACTIONS`), user confirmation prompts for sensitive operations, webpage prompt-injection defenses, and local data clearing controls.

---

## 4. Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHROME SIDE PANEL UI                              │
│                (React + TypeScript + Tailwind CSS + Lucide)                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ chrome.runtime.sendMessage
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKGROUND SERVICE WORKER                           │
│                      (src/background/background.ts)                          │
│                                                                             │
│   ┌────────────────────────────────┐     ┌──────────────────────────────┐   │
│   │ Layer 1: Local Command Parser  │     │ Action Allowlist & Executor  │   │
│   │  (Instant Local Execution)     │────►│  (chrome.tabs, tabGroups,   │   │
│   └──────────────┬─────────────────┘     │   scripting, alarms)         │   │
└──────────────────┼───────────────────────┴──────────────▲───────────────┘
                   │ If complex AI request                │ Returns Action
                   ▼                                      │
┌─────────────────────────────────────────────────────────┴───────────────────┐
│                           EXPRESS BACKEND SERVER                            │
│                        (http://localhost:3001/api)                          │
│                                                                             │
│    POST /chat  │  POST /page-summary  │  POST /reply  │  POST /analyse-claim  │
│                                                                             │
│                                      ▼                                      │
│                           GOOGLE GEMINI 1.5 FLASH                           │
│                   (Structured JSON via Zod Schemas)                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

- **Extension Frontend**: Manifest V3, React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Web Speech API.
- **Chrome Extension APIs**: Chrome Side Panel API, Chrome Tabs API, Chrome Tab Groups API, Chrome Scripting API, Chrome Storage API, Chrome Alarms API, Chrome Runtime Messaging API.
- **Backend API**: Node.js, Express, TypeScript, `@google/generative-ai` (Gemini 1.5 Flash), Zod validation, Helmet, CORS, Express Rate Limit.

---

## 6. Repository Structure

```text
nexora-ai/
│
├── extension/                  # Chrome Extension Frontend
│   ├── public/
│   │   ├── manifest.json       # Manifest V3 Specification
│   │   ├── sidepanel.html      # Side panel entry HTML
│   │   └── icons/              # Extension icons
│   ├── src/
│   │   ├── background/         # Service worker, command router, tab/focus managers
│   │   ├── content/            # DOM text extractor, WhatsApp adapter, YouTube adapter
│   │   ├── sidepanel/          # React components, custom hooks, styles
│   │   ├── services/           # API wrapper, Speech recognition, Chrome storage
│   │   └── shared/             # TypeScript types, action allowlist constants
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Express Backend Server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # REST endpoints (/api/assistant/*)
│   │   ├── services/           # Gemini AI SDK integration & fallbacks
│   │   ├── prompts/            # Prompt-injection defense system prompts
│   │   └── schemas/            # Zod validation schemas
│   ├── .env.example
│   └── package.json
│
├── package.json                # Monorepo orchestration
└── README.md
```

---

## 7. Installation & Quickstart Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- Google Chrome Browser

### Step 1: Install Dependencies
From the repository root directory:
```bash
npm --prefix server install
npm --prefix extension install
```

### Step 2: Configure Environment Variables
Copy `.env.example` in the `server` folder to `.env`:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and add your Google Gemini API Key:
```env
PORT=3001
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: If no API key is provided, Nexora automatically runs in intelligent fallback demo mode for hackathon testing!)*

### Step 3: Build Extension Package
```bash
npm run build:extension
```
This builds the Chrome Extension distribution files into `extension/dist`.

### Step 4: Start Backend Server
```bash
npm run start:server
# Or for development:
npm run dev:server
```
The backend server runs on `http://localhost:3001`. Verify health check at `http://localhost:3001/api/assistant/health`.

---

## 8. Loading the Extension in Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner toggle.
3. Click the **Load unpacked** button.
4. Select the `extension/dist` folder inside your project directory (`c:\Users\visha\Desktop\nexora AI\extension\dist`).
5. Click the puzzle icon in Chrome's top toolbar, find **Nexora AI**, and pin it.
6. Click the Nexora toolbar icon to open the **Chrome Side Panel**!

---

## 9. Hackathon Demonstration Walkthrough

Try the following demo commands inside the side panel:

### Demo 1: Browser Control
- Type: `Open YouTube and search for relaxing lofi music`
- *Result*: YouTube opens and navigates directly to search results for lo-fi music.

### Demo 2: General Knowledge Question
- Type: `Who is Satya Nadella?`
- *Result*: Nexora responds with a concise explanation in the chat thread. Click **Speak** to hear spoken audio output.

### Demo 3: Webpage Summarization
- Open any article webpage (e.g., Wikipedia or news site) and click **Summarize**.
- *Result*: Main page content is extracted safely, and key takeaways appear as bullet points.

### Demo 4: Selected Text Explanation
- Highlight any complex sentence or paragraph on a webpage and click **Explain Text**.
- *Result*: Nexora provides a simplified breakdown of the selected text.

### Demo 5: WhatsApp Web Reply Drafting
- Open [web.whatsapp.com](https://web.whatsapp.com) and click an active chat.
- Switch to the **WhatsApp** sub-tab in Nexora Sidepanel.
- Select tone **Hinglish** or **Professional** and click **Generate Reply**.
- Click **Insert Reply into Composer**. The drafted message populates the WhatsApp input box without sending automatically!

### Demo 6: Suspicious Claim Analysis
- In the WhatsApp panel, click **Check Incoming Message for Scams/Urgency**.
- *Result*: Displays warning signals (e.g. urgency language, unverified promises) and safety recommendations.

### Demo 7: Productivity Focus Session & Tab Clean
- Go to **Focus** sub-tab or type `Start 25 minute focus timer`.
- Click **Group Tabs** or **Close Duplicates** in the **Tools** section.

---

## 10. Privacy & Security

- **Minimum Necessary Permissions**: Uses `activeTab`, `sidePanel`, `storage`, `tabGroups`, `alarms`, and strict host permissions restricted to `web.whatsapp.com` and `youtube.com`.
- **Noeval & Protocol Safety**: Restricts all URL actions to `https:` and `http:` protocols. Evaluates no dynamic code or remote scripts.
- **Untrusted Page Context**: Webpage text is wrapped in system boundaries treating page content as raw data to prevent prompt injection.
- **No Auto-Messaging**: Text insertion into WhatsApp composer requires human review and manual sending.

---

## 11. Troubleshooting

- **Side Panel Doesn't Open**: Ensure you selected `extension/dist` when loading unpacked in `chrome://extensions`.
- **Restricted Page Warning**: Chrome blocks extensions on `chrome://` system URLs. Switch to a normal webpage (`https://...`).
- **Backend Port Busy**: Update `PORT` in `server/.env` and `BACKEND_URL` in `extension/src/shared/constants.ts` if port 3001 is used.

---

## 12. License
MIT License © 2026 Nexora AI Team.
