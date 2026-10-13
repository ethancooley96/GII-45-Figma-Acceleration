# Alchemy Journey Studio

**An AI-powered tool for designing, documenting, and exporting Guidewire Jutro journeys.**

Alchemy Journey Studio helps Business Analysts and UX designers build Guidewire Cloud Platform user journeys — complete with the correct Jutro widgets, a live FloorPlan preview, and a developer-ready export pack — without writing a line of code.

---

## 🚀 Quick Start

1. Open `journey-studio/index.html` in a browser (or use the live Vercel URL)
2. Go to **⚙ Settings** and enter your [OpenRouter API key](https://openrouter.ai) to enable AI generation
3. Click **＋ New Journey** or **📋 Templates** to get started
4. Use the **AI Assist** panel to generate screens and fields
5. Click **Preview** to see your screens in the Jutro FloorPlan shell
6. Click **↓ Export JSON → ↓ Dev Handoff Pack** to download the developer files

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **AI Journey Generation** | Describe a flow in plain English — AI generates multiple screens with correct Guidewire widgets |
| **AI Field Population** | Select a screen, describe its fields — AI adds TypeKeyInput, BooleanRadioInput, CurrencyInput etc. |
| **Jutro FloorPlan Preview** | See screens rendered in the real Guidewire Cloud Platform shell layout |
| **Journey Templates** | Pre-built Claims and Policy templates (Motor FNOL, Property FNOL, Motor Quote, Policy Renewal, MTA) |
| **Screen Layout Designer** | Drag-and-drop PCF widget designer with 3-panel structure view |
| **Dev Handoff Pack** | Downloads a ZIP with `metadata.json`, a React component scaffold, and i18n messages |
| **Import / Export** | Import Figma handoff JSON or export the full journey as a handoff file |

---

## 📁 Repository Structure

```
ai-journey-studio-v1/
├── journey-studio/          # The main web application
│   ├── index.html           # App shell and all modals
│   ├── app.js               # Core state management and screen editor
│   ├── app-extra.js         # Fields designer, PCF layout, preview, import/export
│   ├── app-ai-patch.js      # Smart AI generate (context-aware, no mode toggle)
│   ├── app-jutro-export.js  # Dev Handoff Pack ZIP export
│   ├── app-jutro-preview.js # Jutro FloorPlan preview renderer
│   ├── templates.js         # Pre-built Guidewire journey templates
│   ├── app.css              # All styles
│   ├── tokens.css           # Alchemy design tokens
│   └── components.css       # Alchemy component styles
├── figma-plugin/            # Figma plugin (exports handoff JSON from Figma)
├── documentation/           # Detailed documentation
│   ├── user-guide.md        # Full user guide for BAs and designers
│   └── handoff-format.md    # Technical spec for the handoff JSON format
├── sample-data/             # Example handoff JSON
└── shared/                  # JSON schema for the handoff format
```

---

## 🤖 AI Setup

The app uses **Claude** (via [OpenRouter](https://openrouter.ai)):

1. Create a free account at [openrouter.ai](https://openrouter.ai)
2. Generate an API key
3. In the app, go to **⚙ Settings** → paste your key → Save

Your API key is stored only in browser localStorage — it is never sent to any server other than OpenRouter's API directly.

**Recommended model:** Claude Sonnet 5.5 (balanced speed and quality)

---

## 🏗 Running Locally

No build step required. Open `journey-studio/index.html` directly in any modern browser:

```bash
# macOS / Linux
open journey-studio/index.html

# Windows
start journey-studio/index.html
```

Or use a simple local server:

```bash
cd journey-studio
npx serve .
```

---

## 🌐 Live Deployment

The app is deployed on Vercel. Each push to the `master` branch on GitHub auto-deploys.

---

## 📋 Journey Templates

Ready-to-use Guidewire journey templates are included:

**Claims (ClaimCenter)**
- 🚗 Motor Claims FNOL — 5 screens
- 🏠 Property Claims FNOL — 4 screens

**Policy (PolicyCenter)**
- 🚙 Motor New Business Quote — 4 screens
- 🔄 Policy Renewal — 4 screens
- ✏️ Mid-Term Adjustment (MTA) — 4 screens

---

## 👩‍💻 For Developers

The app is a single-page vanilla JavaScript application — no framework, no build tool, no dependencies.

**Script load order matters** (see `index.html`):
1. `app.js` — core state and UI
2. `app-extra.js` — extended features (overridden by app-ai-patch.js)
3. `app-ai-patch.js` — overrides `aiGenerate()` and `resetJourney()`
4. `app-jutro-export.js` — Dev Handoff Pack
5. `app-jutro-preview.js` — Jutro FloorPlan preview
6. `templates.js` — journey template data and `openTemplateModal()`

The global state object is `S = { journey, screens, cur, dirty, settings }`.

---

## 📄 Documentation

- [User Guide](documentation/user-guide.md) — full guide for BAs and designers
- [Handoff Format](documentation/handoff-format.md) — JSON schema specification

---

*Built by Alchemy · Guidewire Innovation Initiative*
