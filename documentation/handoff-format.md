# Figma Jutro Handoff Format — v1.0

This document describes the JSON handoff file that **Alchemy Journey Studio** exports and the **Alchemy Journey to Figma** plugin imports.

---

## Overview

| Property | Value |
|---|---|
| Format identifier | `figma-jutro-handoff` |
| Format version | `1.0` |
| Schema | `shared/figma-jutro-handoff.schema.json` |
| Sample file | `sample-data/example-handoff.json` |

The handoff file is a single JSON document. The Figma plugin **must** verify `format` and `version` before processing the file.

---

## Top-level structure

```json
{
  "format": "figma-jutro-handoff",
  "version": "1.0",
  "generatedAt": "<ISO 8601 timestamp>",
  "journey": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `format` | `string` (const) | Fixed identifier. Always `"figma-jutro-handoff"`. |
| `version` | `string` (const) | Handoff format version. Always `"1.0"` in this release. |
| `generatedAt` | `string` (date-time) | ISO 8601 timestamp of export. |
| `journey` | `object` | The journey definition. See below. |

---

## `journey`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | URL-safe slug, e.g. `"motor-claims-fnol-journey"`. |
| `name` | `string` | Human-readable name, e.g. `"Motor Claims FNOL Journey"`. |
| `status` | `"draft" \| "review" \| "approved" \| "exported"` | Approval status at time of export. |
| `figmaPageName` | `string` | Suggested Figma page name, e.g. `"Motor Claims FNOL Journey / Generated screens"`. |
| `designSystem` | `object` | See [designSystem](#designsystem). |
| `responsiveFrames` | `array` | See [responsiveFrames](#responsiveframes). Version 1 contains Desktop only. |
| `screens` | `array` | Ordered list of screens. See [screen](#screen). |

### `designSystem`

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Name of the design system the component mappings are based on. |
| `status` | `string` | Advisory note about component mapping accuracy. |

### `responsiveFrames`

Array of frame-size objects. Version 1 always contains a single Desktop entry.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Display name, e.g. `"Desktop"`. |
| `width` | `integer` | Frame width in pixels, e.g. `1440`. |

---

## `screen`

Each screen maps to one Figma frame.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique screen identifier. |
| `order` | `integer` (≥ 1) | 1-based position in the journey. |
| `name` | `string` | Screen name shown in the stepper. |
| `figmaFrameName` | `string` | Suggested Figma frame name, e.g. `"Journey / Incident details"`. |
| `description` | `string` | Instructional subtitle shown below the screen heading. |
| `layout` | `object` | Always `{ "type": "form", "columns": { "desktop": 2 } }` in Version 1. |
| `fields` | `array` | Always-visible fields. See [field](#field). |
| `conditionalSections` | `array` | Conditionally shown sections. See [conditionalSection](#conditionalsection). |
| `actions` | `array` | Buttons at the bottom of the screen. See [action](#action). |
| `prototype` | `object` | Navigation links. See [prototype](#prototype). |

### `prototype`

| Field | Type | Description |
|---|---|---|
| `backScreenId` | `string \| null` | ID of the previous screen. `null` on the first screen. |
| `nextScreenId` | `string \| null` | ID of the next screen. `null` on the last screen. |

---

## `field`

Represents a single form input.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique field identifier. |
| `label` | `string` | Label shown above the input. |
| `inputType` | `"text" \| "email" \| "tel" \| "date" \| "select" \| "textarea" \| "number"` | Input type. |
| `required` | `boolean` | Whether the field is mandatory. |
| `options` | `string[]` | Dropdown options for `select` fields. Empty array for all other types. |
| `figmaComponent` | `string` | Figma component key, e.g. `"Form / Text Input"`. Must be verified against the approved Figma library. |
| `jutroComponent` | `string` | Jutro React component name, e.g. `"TextInput"`. Must be verified against the approved Jutro library. |
| `cssClass` | `string` | CSS class applied to the component, e.g. `"jutro-text-input"`. |
| `states` | `object` | Figma states to generate. See below. |

### `field.states`

Controls which Figma component states the plugin generates for each field.

| Property | Type | Description |
|---|---|---|
| `default` | `boolean` | Generate the default (empty) state. |
| `required` | `boolean` | Generate the required-field state (asterisk label). |
| `error` | `boolean` | Generate the validation error state. |
| `disabled` | `boolean` | Generate the disabled state. |

> **Version 1 note:** Journey Studio always exports `error: false` and `disabled: false`. Error and disabled state generation is reserved for a future version.

---

## `conditionalSection`

A group of fields shown only when a trigger field equals a specific value.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique rule identifier. |
| `sectionName` | `string` | Heading shown above the section. |
| `visibleWhen` | `object` | See below. |
| `fields` | `field[]` | Fields inside the section (min 1). |

### `conditionalSection.visibleWhen`

| Field | Type | Description |
|---|---|---|
| `fieldId` | `string` | ID of the trigger field. |
| `fieldLabel` | `string` | Label of the trigger field (for display). |
| `equals` | `string` | The answer value that shows this section, e.g. `"Yes"`. |

---

## `action`

A button rendered at the bottom of a screen.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique action identifier. |
| `label` | `string` | Button label, e.g. `"Continue"`. |
| `actionType` | `"back" \| "save" \| "continue"` | Semantic type. `back` navigates back; `save` saves a draft; `continue` validates and advances. |
| `figmaComponent` | `string` | Figma component key, e.g. `"Button / Primary"`. |
| `jutroComponent` | `string` | Always `"Button"` in Version 1. |
| `variant` | `"primary" \| "secondary"` | `continue` → `primary`; `back` and `save` → `secondary`. |

---

## Component mapping conventions

| `inputType` | `jutroComponent` | `figmaComponent` |
|---|---|---|
| `text` | `TextInput` | `Form / Text Input` |
| `email` | `TextInput` | `Form / Email Input` |
| `tel` | `TextInput` | `Form / Tel Input` |
| `date` | `DatePicker` | `Form / Date Picker` |
| `select` | `Select` | `Form / Select` |
| `textarea` | `TextArea` | `Form / Text Area` |
| `number` | `NumberInput` | `Form / Number Input` |

> Component names and keys **must be verified** against the approved Figma library and Jutro component library before use.

---

## Validation

The file must validate against `shared/figma-jutro-handoff.schema.json` (JSON Schema Draft-07) before the Figma plugin attempts to import it.

The plugin should reject any file where:
- `format` ≠ `"figma-jutro-handoff"`
- `version` ≠ `"1.0"`
- Schema validation fails
