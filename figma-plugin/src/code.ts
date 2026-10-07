/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 340, height: 480, title: 'Alchemy Journey to Figma' });

// ─── Font helpers ────────────────────────────────────────────────────────────

async function loadFonts() {
  const candidates: FontName[] = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Bold' },
  ];
  let loaded = false;
  for (const font of candidates) {
    try { await figma.loadFontAsync(font); loaded = true; } catch (_) {}
  }
  if (!loaded) {
    await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Roboto', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Roboto', style: 'Bold' });
  }
}

function font(style: 'Regular' | 'Medium' | 'Bold'): FontName {
  const families = ['Inter', 'Roboto', 'Arial'];
  for (const f of families) {
    try { return { family: f, style }; } catch (_) {}
  }
  return { family: 'Inter', style };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hex(h: string): RGB {
  const c = h.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16) / 255,
    g: parseInt(c.slice(2, 4), 16) / 255,
    b: parseInt(c.slice(4, 6), 16) / 255,
  };
}
function solid(h: string): SolidPaint { return { type: 'SOLID', color: hex(h) }; }

// ─── Low-level node factories ────────────────────────────────────────────────

function makeText(
  content: string,
  size: number,
  weight: 'Regular' | 'Medium' | 'Bold',
  colour: string,
  x: number,
  y: number,
  width: number,
): TextNode {
  const t = figma.createText();
  t.fontName = font(weight);
  t.fontSize = size;
  t.fills = [solid(colour)];
  t.characters = content;
  t.x = x; t.y = y;
  t.resize(width, t.height);
  t.textAutoResize = 'HEIGHT';
  return t;
}

function makeRect(
  w: number, h: number, x: number, y: number,
  fill: string, radius: number = 0, strokeColour?: string,
): RectangleNode {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.x = x; r.y = y;
  r.fills = [solid(fill)];
  r.cornerRadius = radius;
  if (strokeColour) {
    r.strokes = [solid(strokeColour)];
    r.strokeWeight = 1;
  }
  return r;
}

// ─── Component builders ──────────────────────────────────────────────────────

// Returns height consumed
function addFormField(
  parent: FrameNode,
  label: string,
  inputType: string,
  required: boolean,
  y: number,
  x: number,
  w: number,
): number {
  const labelText = label + (required ? ' *' : '');
  const lbl = makeText(labelText, 11, 'Medium', '#344054', x, y, w);
  parent.appendChild(lbl);
  let fieldH = 36;

  if (inputType === 'textarea') {
    fieldH = 72;
    const bg = makeRect(w, fieldH, x, y + lbl.height + 4, '#FFFFFF', 6, '#D0D5DD');
    parent.appendChild(bg);
    const ph = makeText('Enter text…', 11, 'Regular', '#98A2B3', x + 10, y + lbl.height + 4 + 10, w - 20);
    parent.appendChild(ph);
  } else if (inputType === 'select') {
    const bg = makeRect(w, fieldH, x, y + lbl.height + 4, '#FFFFFF', 6, '#D0D5DD');
    parent.appendChild(bg);
    const ph = makeText('Select an option', 11, 'Regular', '#98A2B3', x + 10, y + lbl.height + 4 + 10, w - 30);
    parent.appendChild(ph);
    const arrow = makeText('▾', 11, 'Regular', '#667085', x + w - 22, y + lbl.height + 4 + 10, 16);
    parent.appendChild(arrow);
  } else {
    const bg = makeRect(w, fieldH, x, y + lbl.height + 4, '#FFFFFF', 6, '#D0D5DD');
    parent.appendChild(bg);
    const ph = makeText(inputType === 'email' ? 'email@example.com' : 'Enter value', 11, 'Regular', '#98A2B3', x + 10, y + lbl.height + 4 + 10, w - 20);
    parent.appendChild(ph);
  }
  return lbl.height + 4 + fieldH + 16;
}

function addButton(
  parent: FrameNode,
  label: string,
  variant: 'primary' | 'secondary',
  x: number,
  y: number,
  w: number,
): void {
  const isPrimary = variant === 'primary';
  const bg = makeRect(w, 40, x, y, isPrimary ? '#003F50' : '#FFFFFF', 8, isPrimary ? undefined : '#D0D5DD');
  parent.appendChild(bg);
  const lbl = makeText(label, 13, 'Medium', isPrimary ? '#FFFFFF' : '#344054', x, y, w);
  lbl.textAlignHorizontal = 'CENTER';
  lbl.y = y + (40 - lbl.height) / 2;
  parent.appendChild(lbl);
}

// ─── Screen generator ────────────────────────────────────────────────────────

interface HandoffField {
  id: string;
  label: string;
  inputType: string;
  required: boolean;
  options: string[];
  figmaComponent: string;
  jutroComponent: string;
  variant?: string;
}
interface HandoffAction {
  id: string;
  label: string;
  actionType: string;
  figmaComponent: string;
  jutroComponent: string;
  variant?: string;
}
interface HandoffScreen {
  id: string;
  order: number;
  name: string;
  figmaFrameName: string;
  description: string;
  layout: { type: string; columns: { desktop: number } };
  fields: HandoffField[];
  conditionalSections: Array<{ id: string; sectionName: string; fields: HandoffField[] }>;
  actions: HandoffAction[];
}
interface HandoffPayload {
  format: string;
  version: string;
  journey: {
    id: string;
    name: string;
    figmaPageName: string;
    screens: HandoffScreen[];
  };
}

async function generateScreenFromHandoff(screen: HandoffScreen, xOffset: number): Promise<FrameNode> {
  const FRAME_W = 1440;
  const CONTENT_W = 800;
  const CONTENT_X = (FRAME_W - CONTENT_W) / 2;
  const COL_GAP = 24;
  const COL_W = (CONTENT_W - COL_GAP) / 2;
  const COLS = screen.layout?.columns?.desktop ?? 2;

  const frame = figma.createFrame();
  frame.name = screen.figmaFrameName || screen.name;
  frame.resize(FRAME_W, 900);
  frame.x = xOffset;
  frame.y = 0;
  frame.fills = [solid('#F3F7F9')];

  // Header bar
  const header = makeRect(FRAME_W, 64, 0, 0, '#002F3B');
  frame.appendChild(header);
  const title = makeText(screen.name, 18, 'Bold', '#FFFFFF', CONTENT_X, 20, CONTENT_W);
  frame.appendChild(title);

  // Content card
  let curY = 96;
  const card = makeRect(CONTENT_W, 700, CONTENT_X, curY, '#FFFFFF', 12, '#DCE6EA');
  card.name = 'Content Card';
  frame.appendChild(card);

  // Screen title + description
  const scTitle = makeText(screen.name, 22, 'Bold', '#0A2540', CONTENT_X + 32, curY + 28, CONTENT_W - 64);
  frame.appendChild(scTitle);
  const scDesc = makeText(screen.description || '', 13, 'Regular', '#667085', CONTENT_X + 32, curY + 28 + scTitle.height + 6, CONTENT_W - 64);
  frame.appendChild(scDesc);

  // Divider
  const divY = curY + 28 + scTitle.height + 6 + scDesc.height + 16;
  const div = makeRect(CONTENT_W - 64, 1, CONTENT_X + 32, divY, '#DCE6EA');
  frame.appendChild(div);

  // Fields
  let fieldY = divY + 20;
  const fields = screen.fields || [];

  if (COLS === 2 && fields.length > 1) {
    // Two-column layout
    let leftY = fieldY;
    let rightY = fieldY;
    fields.forEach((f, i) => {
      const isLeft = i % 2 === 0;
      const colX = isLeft ? CONTENT_X + 32 : CONTENT_X + 32 + COL_W + COL_GAP;
      const consumed = addFormField(frame, f.label, f.inputType, f.required, isLeft ? leftY : rightY, colX, COL_W);
      if (isLeft) leftY += consumed;
      else rightY += consumed;
    });
    fieldY = Math.max(leftY, rightY);
  } else {
    // Single-column
    for (const f of fields) {
      fieldY += addFormField(frame, f.label, f.inputType, f.required, fieldY, CONTENT_X + 32, CONTENT_W - 64);
    }
  }

  // Conditional sections (annotation only)
  if (screen.conditionalSections && screen.conditionalSections.length > 0) {
    for (const cs of screen.conditionalSections) {
      const note = makeText(
        `⚙ Conditional: "${cs.sectionName}" — shown when condition is met`,
        10, 'Regular', '#6246A8', CONTENT_X + 32, fieldY, CONTENT_W - 64
      );
      frame.appendChild(note);
      fieldY += note.height + 8;
      for (const f of cs.fields) {
        fieldY += addFormField(frame, f.label + ' (conditional)', f.inputType, f.required, fieldY, CONTENT_X + 32, CONTENT_W - 64);
      }
    }
  }

  // Divider before buttons
  fieldY += 8;
  const div2 = makeRect(CONTENT_W - 64, 1, CONTENT_X + 32, fieldY, '#DCE6EA');
  frame.appendChild(div2);
  fieldY += 20;

  // Actions
  const actions = screen.actions || [];
  if (actions.length > 0) {
    const BTN_W = 180;
    const BTN_GAP = 12;
    const totalW = actions.length * BTN_W + (actions.length - 1) * BTN_GAP;
    let btnX = CONTENT_X + 32 + CONTENT_W - 64 - totalW;
    for (const a of actions) {
      const isPrimary = a.variant === 'primary' || a.actionType === 'continue' || a.actionType === 'submit';
      addButton(frame, a.label, isPrimary ? 'primary' : 'secondary', btnX, fieldY, BTN_W);
      btnX += BTN_W + BTN_GAP;
    }
    fieldY += 40;
  }

  // Resize frame to content
  const totalH = fieldY + 48;
  frame.resize(FRAME_W, Math.max(totalH, 640));

  return frame;
}

// ─── Example screen (hardcoded) ──────────────────────────────────────────────

async function createExampleScreen() {
  await loadFonts();

  // Find or create page
  let page = figma.root.children.find(p => p.name === 'Journey Studio / Test') as PageNode | undefined;
  if (!page) { page = figma.createPage(); page.name = 'Journey Studio / Test'; }
  figma.currentPage = page;

  const FRAME_W = 1440;
  const CONTENT_W = 800;
  const CONTENT_X = (FRAME_W - CONTENT_W) / 2;

  const frame = figma.createFrame();
  frame.name = 'Contact details';
  frame.resize(FRAME_W, 820);
  frame.fills = [solid('#F3F7F9')];

  const header = makeRect(FRAME_W, 64, 0, 0, '#002F3B');
  frame.appendChild(header);
  const headerTitle = makeText('Customer Journey', 16, 'Bold', '#FFFFFF', CONTENT_X, 20, CONTENT_W);
  frame.appendChild(headerTitle);

  const card = makeRect(CONTENT_W, 680, CONTENT_X, 96, '#FFFFFF', 12, '#DCE6EA');
  frame.appendChild(card);

  const scTitle = makeText('Contact details', 22, 'Bold', '#0A2540', CONTENT_X + 32, 124, CONTENT_W - 64);
  frame.appendChild(scTitle);
  const scDesc = makeText('Please provide your contact information to continue.', 13, 'Regular', '#667085', CONTENT_X + 32, 156, CONTENT_W - 64);
  frame.appendChild(scDesc);

  const div1 = makeRect(CONTENT_W - 64, 1, CONTENT_X + 32, 185, '#DCE6EA');
  frame.appendChild(div1);

  const fieldDefs: Array<[string, string, boolean]> = [
    ['First name', 'text', true],
    ['Last name', 'text', true],
    ['Email address', 'email', true],
    ['Telephone number', 'tel', false],
    ['Preferred contact method', 'select', true],
  ];

  const COL_W = (CONTENT_W - 64 - 24) / 2;
  let leftY = 205, rightY = 205;
  fieldDefs.forEach(([label, type, req], i) => {
    const isLeft = i % 2 === 0;
    const colX = isLeft ? CONTENT_X + 32 : CONTENT_X + 32 + COL_W + 24;
    const h = addFormField(frame, label, type, req,
      isLeft ? leftY : rightY, colX, COL_W);
    if (isLeft) leftY += h; else rightY += h;
  });

  const maxFieldY = Math.max(leftY, rightY) + 8;
  const div2 = makeRect(CONTENT_W - 64, 1, CONTENT_X + 32, maxFieldY, '#DCE6EA');
  frame.appendChild(div2);

  const btnY = maxFieldY + 20;
  addButton(frame, 'Save and continue later', 'secondary', CONTENT_X + 32 + (CONTENT_W - 64) - 372, btnY, 180);
  addButton(frame, 'Continue', 'primary', CONTENT_X + 32 + (CONTENT_W - 64) - 180, btnY, 180);

  page.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);

  let fontUsed = 'Inter';
  try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); fontUsed = 'Inter'; } catch (_) {
    try { await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' }); fontUsed = 'Roboto'; } catch (__) { fontUsed = 'Arial'; }
  }

  figma.ui.postMessage({ type: 'success', message: `Screen created using ${fontUsed}. Open page "Journey Studio / Test".` });
}

// ─── Generate from handoff JSON ───────────────────────────────────────────────

async function generateFromHandoff(payload: HandoffPayload) {
  await loadFonts();

  const pageName = payload.journey.figmaPageName || (payload.journey.name + ' / Generated screens');
  let page = figma.root.children.find(p => p.name === pageName) as PageNode | undefined;
  if (!page) { page = figma.createPage(); page.name = pageName; }
  figma.currentPage = page;

  const screens = payload.journey.screens;
  const FRAME_GAP = 80;
  let xOffset = 0;
  const frames: FrameNode[] = [];

  for (const screen of screens) {
    const frame = await generateScreenFromHandoff(screen, xOffset);
    page.appendChild(frame);
    frames.push(frame);
    xOffset += frame.width + FRAME_GAP;
  }

  figma.viewport.scrollAndZoomIntoView(frames);
  figma.ui.postMessage({
    type: 'success',
    message: `${screens.length} screen${screens.length !== 1 ? 's' : ''} generated on page "${pageName}".`,
  });
}

// ─── Message router ───────────────────────────────────────────────────────────

figma.ui.onmessage = async (msg: { type: string; payload?: HandoffPayload }) => {
  try {
    if (msg.type === 'create-example-screen') {
      await createExampleScreen();
    } else if (msg.type === 'generate-from-handoff' && msg.payload) {
      await generateFromHandoff(msg.payload);
    } else {
      figma.ui.postMessage({ type: 'error', message: 'Unknown message type: ' + msg.type });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    figma.ui.postMessage({ type: 'error', message });
  }
};
