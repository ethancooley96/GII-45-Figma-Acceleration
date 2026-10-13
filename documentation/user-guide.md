# Alchemy Journey Studio — User Guide

**Version 1.0 · October 2026**

---

## Table of Contents

1. [What is Alchemy Journey Studio?](#1-what-is-alchemy-journey-studio)
2. [Getting Started](#2-getting-started)
3. [Creating a Journey](#3-creating-a-journey)
4. [Using the AI Assist Panel](#4-using-the-ai-assist-panel)
5. [Journey Templates](#5-journey-templates)
6. [Building Screens Manually](#6-building-screens-manually)
7. [Designing Fields and Widgets](#7-designing-fields-and-widgets)
8. [Screen Layout Designer](#8-screen-layout-designer)
9. [Jutro FloorPlan Preview](#9-jutro-floorplan-preview)
10. [Exporting Your Work](#10-exporting-your-work)
11. [Saving and Loading Journeys](#11-saving-and-loading-journeys)
12. [AI Prompt Examples](#12-ai-prompt-examples)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. What is Alchemy Journey Studio?

Alchemy Journey Studio is an AI-powered design tool for Business Analysts and UX designers working on Guidewire Cloud Platform projects.

It lets you:

- **Design** user journeys with the correct Guidewire Jutro widgets (TypeKeyInput, BooleanRadioInput, CurrencyInput etc.)
- **Preview** your screens inside the real Guidewire Cloud Platform FloorPlan shell
- **Export** a developer-ready pack containing Jutro metadata, a React component scaffold, and i18n messages

The tool bridges the gap between a BA's design intent and a developer's implementation — saving hours of handoff time on every screen.

---

## 2. Getting Started

### Opening the App

Open `journey-studio/index.html` in any modern browser (Chrome, Edge, Firefox). No installation required.

If you have been given a Vercel URL, open that instead — no local setup needed.

### Setting Up Your API Key

The AI features require a Claude API key via [OpenRouter](https://openrouter.ai):

1. Go to [openrouter.ai](https://openrouter.ai) and create a free account
2. Click **Keys** → **Create Key**
3. In Alchemy Journey Studio, click **⚙ Settings** in the left sidebar
4. Paste your key into the **OpenRouter API Key** field
5. Click **Save Settings**

> **Privacy note:** Your API key is stored only in your browser's local storage. It is sent directly to OpenRouter's API — it is never stored on any Alchemy server.

### Choosing a Model

In Settings you can choose between:

| Model | Best for |
|---|---|
| Claude Sonnet 5.5 | Balanced — recommended for most use |
| Claude Opus 5.5 | Best quality for complex journeys |
| Claude Fable 5.1 | Fastest responses |

---

## 3. Creating a Journey

A **Journey** is the container for all your screens. You must create one before adding screens.

### Option A — Start from scratch

1. Click **＋ New Journey** on the welcome screen
2. Enter a **Journey Name** (e.g. "Motor Claims FNOL")
3. Optionally enter a Product (e.g. "ClaimCenter") and Team
4. Click **Create Journey**

### Option B — Start from a Template

1. Click **📋 Templates** on the welcome screen
2. Browse the pre-built Claims and Policy templates
3. Click **Use Template** on any template to load it instantly

### Option C — Import an existing handoff

1. Click **↑ Import Handoff**
2. Paste the JSON from a previous export or a Figma plugin export
3. Click **Import**

---

## 4. Using the AI Assist Panel

The AI Assist panel is in the left sidebar under **✦ AI Assist**. It automatically detects what to do based on context — you never need to select a mode.

### Generating a full journey (no screen selected)

When no screen is open, typing a prompt generates new screens:

> "A motor insurance new business journey with screens for driver details, vehicle details, coverage selection and quote summary"

The AI creates up to 3 screens (configurable in Settings) with:
- Correct Guidewire widget types for every field
- Panel/section groupings
- Navigation links between screens (onSuccess, onBack)
- CTA and back button labels

### Adding fields to a screen (screen selected)

When a screen is open in the editor, the toggle **"Add fields to [screen name]"** appears. When checked (default), the AI adds fields directly to the current screen:

> "Driver details including date of birth, years driving experience, no claims discount, and any convictions in the last 5 years"

### Generating new screens when a screen is open

If you want to generate more screens while a screen is already open:

1. **Uncheck** the "Add fields to [screen name]" toggle
2. Write your prompt as normal
3. The AI will generate new screens instead of adding fields

### Tips for better AI results

- Be specific about field names: *"Date of incident, type of incident (dropdown), was anyone injured (yes/no)"* produces better results than *"incident fields"*
- Mention Guidewire-specific context: *"ClaimCenter FNOL form"* helps the AI use the right widget types
- For complex journeys, use the Max screens setting in Settings to allow up to 5 screens

---

## 5. Journey Templates

Templates are pre-built journeys with realistic Guidewire fields, correct widget types, and navigation already configured.

### Available Templates

**Claims (ClaimCenter)**

| Template | Screens | Key Fields |
|---|---|---|
| 🚗 Motor Claims FNOL | 5 | Incident type, vehicle details, driver details, third party, declaration |
| 🏠 Property Claims FNOL | 4 | Incident type, property details, damage value, declaration |

**Policy (PolicyCenter)**

| Template | Screens | Key Fields |
|---|---|---|
| 🚙 Motor New Business Quote | 4 | Driver details, vehicle details, coverage selection, quote summary |
| 🔄 Policy Renewal | 4 | Policy review, coverage options, payment preference, confirmation |
| ✏️ Mid-Term Adjustment | 4 | Change type, change details, review, confirmation |

### Loading a Template

1. Click **📋 Templates**
2. Click **Use Template** on your chosen template
3. The journey loads immediately — you can then customise any screen or field

---

## 6. Building Screens Manually

### Adding a screen

- Click **＋** next to "Screens" in the sidebar, or
- Click **+ Add Screen** in the top toolbar

Fill in:
- **Screen Name** — used as the page title (e.g. "Driver Details")
- **Screen Type** — Form, Confirmation, Info, List, Dashboard, or Error
- **Step Number** — auto-numbered if left blank
- **Description** — shown as the screen subtitle

### Reordering screens

Drag the ⠿ handle on any screen in the sidebar to reorder. Step numbers update automatically.

### Duplicating a screen

With a screen open, click **Duplicate** in the top right of the editor. The copy is added at the end of the journey.

### Deleting a screen

Click the **✕** button on a screen in the sidebar, or use the **Delete Screen** button in the editor.

---

## 7. Designing Fields and Widgets

The **Fields** tab shows all fields on the current screen.

### Adding a field manually

Click **+ Add Field** to add a blank field. Each field has:
- **Label** — the display name shown to users
- **Type** — the HTML input type (used for the field list view)
- **Required** — tick to mark the field as required

### Guidewire Widget Types

The **Screen Layout** view (see section 8) lets you assign proper Guidewire widget types to each field. The available widgets are:

| Widget | Use for |
|---|---|
| `TextInput` | Free text input |
| `TypeKeyInput` | Dropdown / enum selection |
| `DateInput` | Date picker |
| `CurrencyInput` | Monetary values |
| `IntegerInput` | Whole number inputs |
| `BooleanRadioInput` | Yes / No radio buttons |
| `RangeInput` | Ranged enum selection |
| `TextAreaInput` | Multi-line text |
| `EmailInput` | Email address |
| `PhoneInput` | Phone number |
| `PasswordInput` | Password field |
| `ButtonInput` | Action button |
| `Label` | Static display text |
| `AlertBar` | Information banner |

### TypeKeyInput — setting enum values

For TypeKeyInput fields, set the **Type Key** in the widget properties modal:

1. In Screen Layout view, click the **✎ edit** button on a TypeKeyInput card
2. Enter comma-separated values in the **Type Key** field: e.g. `Comprehensive,Third Party,Third Party Fire and Theft`
3. Click Save Widget

### BooleanRadioInput — customising labels

1. Edit the widget properties
2. Set **True Label** (e.g. `Yes`) and **False Label** (e.g. `No`)
3. Click Save Widget

---

## 8. Screen Layout Designer

The **Screen Layout** view (click **🖥 Screen Layout** in the Fields tab toolbar) shows a 3-panel designer:

```
[ Structure tree ] | [ PCF Canvas ] | [ Widget toolbox ]
```

### Structure tree (left panel)

Shows the hierarchy: Screen → InputSets (panels) → Fields. Click any item to select it.

### PCF Canvas (centre panel)

Shows your screen as it would appear in PCF, with fields displayed as cards in a 2-column grid within panels. You can:
- Drag cards between panels
- Drag cards to reorder within a panel
- Click the **✎** button to edit widget properties
- Click the **✕** button to delete a field

### Widget Toolbox (right panel)

Drag any widget from the toolbox onto a panel in the canvas, or click it to add it to the first available panel.

### Managing Panels

- Click **+ Add Panel** in the toolbar to create a new panel (InputSet)
- Click **✎ Rename** on a panel header to rename it
- Click **🗑** on a panel header to delete it and all its fields

---

## 9. Jutro FloorPlan Preview

The **Preview** tab shows your screen rendered inside the Guidewire Cloud Platform FloorPlan shell — matching the layout users will see in the real application.

### View vs Edit mode

The preview has two modes:
- **Edit** — input fields are active (default when a screen is opened)
- **View** — fields show as read-only dashes

Click the toggle at the top right of the preview to switch.

### What the preview shows

- Dark navy top bar with Guidewire logo and search
- Tab bar with your screen name as the active tab
- Left navigation panel with standard items
- Page title and View/Edit toggle
- All your fields grouped by panel, with correct input types rendered
- CTA and back buttons at the bottom of the form

> **Note:** The preview is a communication aid for reviewing and validating screen structure. The actual rendering in production will use the real Jutro React components — the preview is an approximation of the visual layout.

---

## 10. Exporting Your Work

### Export Handoff JSON

Exports the full journey as a JSON file in the figma-jutro-handoff format:

1. Click **↓ Export JSON** in the sidebar
2. In the Export modal, click **↓ Download JSON**

This file can be re-imported into Alchemy Journey Studio or passed to other tools.

### Dev Handoff Pack

Downloads a ZIP file containing everything a developer needs:

1. Click **↓ Export JSON** in the sidebar
2. Click **↓ Dev Handoff Pack**

The ZIP contains:

| File | Contents |
|---|---|
| `metadata.json` | Jutro screen definition — widget types, labels, required flags, sections |
| `[JourneyName]Screen.jsx` | React component scaffold with imports and field stubs |
| `messages.json` | i18n label strings for localisation |

**What a developer does with the Dev Handoff Pack:**
- Import `metadata.json` into their Jutro page config
- Fill in the data binding paths in the JSX component (e.g. replace `[field.dataPath]` with `vehicle.make`)
- Add the i18n messages to their translations file
- Wire up submit/navigation handlers

### Download CSS

Generates a basic CSS skeleton with class names matching each screen and field. Useful as a starting point for custom styling.

---

## 11. Saving and Loading Journeys

### Auto-save to browser

Your journey is saved automatically to browser localStorage when you click **Save** in the toolbar. It will be restored when you reopen the app.

> **Important:** localStorage is browser and device-specific. If you clear your browser data, your journey will be lost. Always export your journey as JSON for safe keeping.

### Manual save

Click **Save** in the top toolbar at any time. The status pill changes from "● Unsaved" to "✓ Saved".

### Restoring a journey

1. Click **↑ Import Handoff**
2. Click **Browse File…** and select a previously exported JSON file
3. Click **Import**

### Reset

To clear everything and start fresh, click **↺ Reset** in the sidebar Project section. This clears localStorage and all screens.

---

## 12. AI Prompt Examples

### Journey generation (no screen selected)

| Prompt | What it generates |
|---|---|
| `A motor claims FNOL journey with 3 screens` | Incident details, vehicle details, submission |
| `Property damage claim journey — damage report, photos upload, assessment, confirmation` | 4 screens with appropriate fields |
| `Motor insurance new business quote — driver, vehicle, coverage, quote` | 4 screens with TypeKeyInputs and CurrencyInputs |
| `Policy renewal with review, amendments, payment and confirmation` | 4 screens |
| `Customer service request journey` | Request details, review, submission |

### Adding fields to a screen (screen selected, toggle on)

| Prompt | What it adds |
|---|---|
| `Vehicle details: registration, make, model, year, estimated value, annual mileage` | 6 fields with correct types |
| `Driver details including DOB, licence type, years experience, no claims, any convictions` | 5 fields, BooleanRadioInput for convictions |
| `Payment section: payment method dropdown, bank account number, sort code, direct debit confirmation` | 4 fields |
| `Third party details: name, vehicle registration, insurer, police involved (yes/no)` | 4 fields, BooleanRadioInput for police |
| `Coverage selection with cover type, voluntary excess, legal expenses add-on, breakdown cover` | 4 fields, TypeKeyInputs and BooleanRadioInputs |

---

## 13. Troubleshooting

### "Add an API key in ⚙ Settings first"

You haven't added an OpenRouter API key. Go to **⚙ Settings** → enter your key → Save.

### "Invalid JSON after retry"

The AI response was too long and got cut off. Try:
- Reducing the Max screens setting to 2 or 3
- Breaking a complex journey into smaller prompts (e.g. generate 2 screens first, then add more)
- Refreshing the page and trying again (sometimes a transient API issue)

### AI generates but nothing appears

Check the browser console (F12) for errors. Common causes:
- Network issue with the OpenRouter API
- The model is overloaded — try again in a few seconds
- Invalid API key — check your key in Settings

### The preview doesn't look like our Jutro app

The preview is an approximation based on the Guidewire Cloud Platform FloorPlan layout. Minor visual differences are expected — the data structure in the exported files is what matters for the developer, not the pixel accuracy of the preview.

### My journey disappeared after closing the browser

If you didn't click **Save**, the journey was not stored. Always click **Save** before closing, or export your journey as JSON first. To prevent data loss, the status pill shows "● Unsaved" whenever there are unsaved changes.

### The screen layout designer shows "Select a screen to open the designer"

You need to have a screen open in the editor first. Click on a screen name in the left sidebar, then switch to the Fields tab and select Screen Layout view.

---

*For technical queries or to report issues, contact the Alchemy team.*
