# Nexora AI — Intelligent In-Browser Copilot

<div align="center">

[![Chrome Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundled_with-Vite_5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/AI_Engine-Google_Gemini_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styled_with-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Talk to your browser. Understand any webpage. Stay productive without leaving your flow.**

</div>

---

## 📌 1. Overview

**Nexora AI** is a lightweight, privacy-focused, AI-powered browser copilot embedded natively inside Google Chrome's **Side Panel**. Unlike generic chatbot tabs, Nexora AI is aware of your active browsing context: it reads webpage content in real-time, answers questions about what you are viewing, cleans up tab clutter, and executes browser actions via text or voice.

### 🌟 What Makes Nexora AI Different?
- **100% Serverless & Standalone**: Communicates directly with Google Gemini's Generative Language API from within the extension. **No background server, no Node.js terminal, and no local ports needed to run!**
- **Zero-Disturbance Design**: Executes actions in background tabs without hijacking your active focus.
- **Zero-Typing Suggestion Engine**: Rich, categorized instant-action chips that let you perform summaries, tab cleaning, and searches with a single tap.
- **Multilingual Context Understanding**: Native support for English, Hindi, and Hinglish queries (e.g., *"Is page ko aasan Hindi me samjhao"* or *"Wiki kitni baar likha hua hai?"*).

---

## 🚀 2. Key Features

### 🧠 Direct In-Extension Gemini AI
- Powered by Google's latest **Gemini Flash models** (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3-flash-preview`, and `gemini-3.6-flash`).
- Built-in automatic model failover ensures uninterrupted responses even during high API demand.
- Full context grounding: passes clean extracted page headings, word counts, and readable text to the model.

### 📑 Active Webpage Intelligence
- **Reading Time & Word Count**: Automatically analyzes active page density (e.g., `~1,250 words • 4 min read`).
- **⚡ 30s Executive Summary**: Synthesizes the core thesis and takeaways of any article or documentation.
- **🌐 Hindi Explanation**: Translates and breaks down complex technical or English articles into clear, accessible Hindi.
- **💡 Key Points Extraction**: Extracts the top 5 bullet takeaways from long-form content.
- **🔍 Explain Selection**: Highlight any paragraph on any webpage and receive an instant simplified breakdown.

### ⚡ Smart Suggestions (Zero-Typing Experience)
- **Interactive Suggestion Pills**: Filter by category (*All*, *Page Insights*, *Browser Controls*, *Search & Media*).
- **1-Click Execution**: Tap any chip to execute without typing:
  - `📄 30s Summary`
  - `🌐 Hindi me Samjhao`
  - `💡 5 Key Takeaways`
  - `🔍 "Wiki" count karo`
  - `🧹 Close Duplicate Tabs`
  - `📂 Group Open Tabs`
  - `🎵 Play Lo-Fi Music`
  - `🔎 Search Free Meeting`
  - `⏱️ 25m Focus Timer`

### 📑 Browser Tab & Workspace Management
- **Duplicate Tab Detection**: Identifies and closes duplicate tabs with smart URL normalization (stripping tracking parameters and hashes).
- **Domain Categorization**: Automatically groups open tabs into colored Chrome tab groups (*Study, Work, Social, Media, Documentation*).
- **Tab Controls**: Instant mute/unmute, page refresh, and back/forward navigation.

### 🎙️ Hands-Free Push-to-Talk Voice
- Built with the browser's native **Web Speech API** for rapid speech-to-text.
- **1-Click Permission Helper (`permission.html`)**: Solves Chrome's Side Panel audio permission restriction with a seamless one-time grant tab.
- Spoken audio responses via **SpeechSynthesis** (customizable in settings).

---

## 🏗️ 3. Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CHROME SIDE PANEL UI                               │
│              (React 18 + TypeScript + Tailwind CSS + Lucide)                │
│                                                                             │
│  [ Header & Status ]  [ Active Page Card ]  [ Chat Feed ]  [ Suggestion Chips]
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        User Command / Chip Clicked
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TWO-LAYER COMMAND ROUTER                            │
│                                                                             │
│  ┌─────────────────────────────────┐      ┌──────────────────────────────┐  │
│  │ Layer 1: Local Command Parser   │      │ Layer 2: Direct Gemini AI    │  │
│  │  (Instant Regex Execution)      │      │  (Serverless In-Extension)   │  │
│  │  • Mute Tab      • Clean Tabs   │      │  • Page Summaries            │  │
│  │  • Focus Timer   • YouTube Search│     │  • Hindi Explanations        │  │
│  │  • Web Search    • Group Tabs   │      │  • Keyword Frequency         │  │
│  └────────────────┬────────────────┘      └──────────────┬───────────────┘  │
└───────────────────┼──────────────────────────────────────┼──────────────────┘
                    │                                      │
                    ▼                                      ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│       CHROME EXTENSION NATIVE APIs   │  │    GOOGLE GENERATIVE LANGUAGE     │
│   chrome.tabs       chrome.tabGroups │  │              REST API             │
│   chrome.scripting  chrome.alarms    │  │  (gemini-3.5-flash / 3.6-flash)   │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 💻 4. Technology Stack

- **Extension Framework**: Manifest V3 (MV3) specification
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Build System**: Vite 5 with Rollup chunking
- **AI Integration**: Google Generative Language REST API (Gemini 3.5 & 3.6 Flash)
- **Native Extension APIs**:
  - `chrome.sidePanel`: Embedded side panel experience
  - `chrome.tabs` & `chrome.tabGroups`: Tab lifecycle, grouping, and tab cleaning
  - `chrome.scripting`: Non-destructive DOM content extraction
  - `chrome.alarms`: Persistent Pomodoro timer background intervals
  - `chrome.storage.local`: Settings, chat history, and API key preferences

---

## 📁 5. Repository Structure

```text
nexora-ai/
│
├── extension/                  # Chrome Extension Root
│   ├── public/
│   │   ├── manifest.json       # Manifest V3 Configuration & Host Permissions
│   │   ├── permission.html     # 1-Click Microphone Permission Helper
│   │   └── icons/              # Extension icons (16px, 48px, 128px)
│   ├── src/
│   │   ├── background/         # Service Worker & Action Executors
│   │   │   ├── background.ts         # Service worker message router
│   │   │   ├── actionExecutor.ts     # Chrome API action handler
│   │   │   ├── localCommandParser.ts # Deterministic command regex parser
│   │   │   ├── tabManager.ts         # Tab grouping & duplicate cleanup
│   │   │   └── focusManager.ts       # 25-minute Pomodoro alarm logic
│   │   ├── content/            # Webpage Content Scripts
│   │   │   ├── content.ts            # Content script message bridge
│   │   │   └── pageExtractor.ts      # Safe DOM text & heading extractor
│   │   ├── services/           # Services & AI Engine
│   │   │   ├── geminiDirect.ts       # 🚀 Direct Google Gemini REST API Client
│   │   │   ├── api.ts                # Unified API service layer
│   │   │   ├── speech.ts             # Web Speech recognition & TTS
│   │   │   └── storage.ts            # Local Chrome storage wrapper
│   │   ├── sidepanel/          # React User Interface
│   │   │   ├── App.tsx               # Main Copilot Application
│   │   │   ├── components/           # UI Components (Header, PageCard, Chat)
│   │   │   └── hooks/                # Custom React hooks (Voice, TabState, Timer)
│   │   └── shared/             # TypeScript Types & Constants
│   ├── vite.config.ts          # Vite build configuration
│   └── package.json            # Extension dependencies
│
├── server/                     # (Optional) Express backend server for custom setups
├── package.json                # Monorepo orchestration scripts
└── README.md                   # Project documentation
```

---

## ⚡ 6. Installation & Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Google Chrome](https://www.google.com/chrome/) browser

### Step 1: Clone the Repository
```bash
git clone https://github.com/rohitpal00015-prog/nexos.git
cd nexos
```

### Step 2: Install Dependencies & Build
```bash
npm --prefix extension install
npm run build:extension
```
This will compile the extension and generate distribution assets in `extension/dist`.

---

## 🧩 7. Loading into Google Chrome

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `extension/dist` folder inside your cloned repository:
   ```text
   c:\Users\...\nexos\extension\dist
   ```
5. Click the puzzle piece icon (Extensions) in Chrome's top toolbar, find **Nexora AI**, and pin it.
6. Click the pinned Nexora AI icon to launch the **Side Panel**!

> [!TIP]
> **No Backend Required**: Nexora AI connects directly to Google Gemini from inside the browser. You do **not** need to keep any terminal or Node.js server running!

---

## 🎯 8. Example Commands & Usage

Try testing the following interactions inside the Side Panel:

| Type | What to Say / Click | What Nexora Does |
| :--- | :--- | :--- |
| **Page Summary** | Tap `📄 30s Summary` | Generates a 30-second structured breakdown of the active page. |
| **Hindi Analysis** | Tap `🌐 Hindi me Samjhao` | Explains the active article in natural, conversational Hindi/Hinglish. |
| **Tab Cleanup** | Tap `🧹 Close Duplicate Tabs` | Analyzes all open tabs, finds matching URLs, and closes duplicates. |
| **Tab Grouping** | Say: *"Group my open tabs"* | Organizes open tabs into colored domain groups (*Work, Media, Social*). |
| **Web Search** | Say: *"Go to web and search free meeting"* | Instantly triggers Google Search in a background/new tab. |
| **Lo-Fi Music** | Tap `🎵 Play Lo-Fi Music` | Navigates directly to YouTube relaxing study beats. |
| **Text Explanation** | Highlight any paragraph on a page & click `Explain Selected` | Simplifies the highlighted sentence or jargon clearly. |
| **Keyword Count** | Type: *"mere page per wiki kitani time likha huaa h"* | Analyzes page text and counts the occurrences of the keyword. |

---

## 🔒 9. Privacy & Security

- **Strict Allowlisting**: Browser actions are strictly gated by `ALLOWED_ACTIONS` (`SEARCH_WEB`, `OPEN_URL`, `MUTE_CURRENT_TAB`, etc.). Remote prompts cannot execute arbitrary JavaScript.
- **Untrusted DOM Boundaries**: Content extracted from webpages is treated as raw data. Embedded instructions inside third-party pages are ignored.
- **Local Control**: API keys and chat histories are stored exclusively in Chrome's isolated `chrome.storage.local`.
- **No Foreground Hijacking**: Background tasks run without interrupting your mouse, keyboard, or active reading flow.

---

## 📄 10. License

This project is licensed under the **MIT License**.

© 2026 Nexora AI Team. Built with ❤️ for intelligent, distraction-free web browsing.
