/* AI Journey Studio — app-jutro-export.js
   Generates Jutro metadata JSON, React component scaffold, and i18n messages
   for all screens in the current journey.
   Produces a downloadable ZIP (no server needed — pure client-side).
*/

/* ── Widget → Jutro component mapping ────────────── */
var _JUTRO_COMPONENT_MAP = {
  'Input':             { component:'InputField',          dataType:'string' },
  'TextInput':         { component:'InputField',          dataType:'string' },
  'EmailInput':        { component:'InputField',          dataType:'string', inputType:'email' },
  'PhoneInput':        { component:'InputField',          dataType:'string', inputType:'tel' },
  'PasswordInput':     { component:'InputField',          dataType:'string', inputType:'password' },
  'TypeKeyInput':      { component:'DropdownSelectField', dataType:'string' },
  'RangeInput':        { component:'DropdownSelectField', dataType:'string' },
  'DateInput':         { component:'DateField',           dataType:'date' },
  'CurrencyInput':     { component:'CurrencyField',       dataType:'number' },
  'IntegerInput':      { component:'NumberField',         dataType:'number' },
  'BooleanRadioInput': { component:'ToggleField',         dataType:'boolean' },
  'TextAreaInput':     { component:'TextAreaField',       dataType:'string' },
  'ButtonInput':       { component:'Button',              dataType:null },
  'ToolbarButton':     { component:'Button',              dataType:null },
  'DirectInvokeInput': { component:'Button',              dataType:null },
  'Label':             { component:'Element',             dataType:null },
  'AlertBar':          { component:'NotificationElement', dataType:null }
};

/* ── Helpers ──────────────────────────────────────── */

function _toId(str) {
  /* Convert "Policy Number" → "policyNumber" (camelCase) */
  return str.replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+(.)/g, function(_, c){ return c.toUpperCase(); })
    .replace(/^(.)/, function(_, c){ return c.toLowerCase(); });
}

function _toPascalCase(str) {
  return str.replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/(?:^|\s)(.)/g, function(_, c){ return c.toUpperCase(); })
    .replace(/\s/g,'');
}

function _toMsgKey(screenId, fieldId, suffix) {
  return screenId + '.' + fieldId + (suffix ? '.' + suffix : '');
}

/* ── Build metadata.json for one screen ──────────── */
function _buildMetadata(scr, journeyName) {
  var pageId   = _toPascalCase(scr.name) + 'Page';
  var messages = {};

  /* Page title message */
  messages[pageId + '.title'] = scr.name;
  if(scr.description) messages[pageId + '.description'] = scr.description;

  /* Group fields by section (panel) */
  var panels = []; var panelMap = {};
  (scr.fields||[]).forEach(function(f){
    var sec = f.section || scr.name || 'Details';
    if(!panelMap[sec]){ panelMap[sec]=[]; panels.push(sec); }
    panelMap[sec].push(f);
  });
  if(!panels.length && scr.fields && scr.fields.length) panels = [scr.name||'Details'];

  /* Build content array */
  var content = [];

  panels.forEach(function(panelName){
    var panelId      = _toId(panelName) + 'Panel';
    var panelContent = [];
    messages[pageId + '.' + panelId + '.title'] = panelName;

    (panelMap[panelName]||[]).forEach(function(f){
      var fid     = _toId(f.label || f.id);
      var jutroInfo = _JUTRO_COMPONENT_MAP[f.gwWidget] || { component:'InputField', dataType:'string' };
      var msgKey  = pageId + '.' + fid + '.label';
      messages[msgKey] = f.label || fid;
      if(f.helpText) messages[pageId + '.' + fid + '.tooltip'] = f.helpText;

      var compProps = {
        label: '{{' + msgKey + '}}',
        required: !!f.required,
        id: fid
      };

      if(jutroInfo.dataType)   compProps.dataType  = jutroInfo.dataType;
      if(jutroInfo.inputType)  compProps.inputType = jutroInfo.inputType;
      if(f.helpText)           compProps.tooltip   = '{{' + pageId + '.' + fid + '.tooltip}}';
      if(f.placeholder)        compProps.placeholder = f.placeholder;

      /* TypeKeyInput / RangeInput — add availableValues from typeKey */
      if((f.gwWidget === 'TypeKeyInput' || f.gwWidget === 'RangeInput') && f.gwProps && f.gwProps.typeKey) {
        var vals = f.gwProps.typeKey.split(',').map(function(v){ v=v.trim(); return { code:v, name:v }; });
        compProps.availableValues = vals;
      }

      /* BooleanRadioInput — add true/false labels */
      if(f.gwWidget === 'BooleanRadioInput') {
        var tl = (f.gwProps && f.gwProps.trueLabel)  || 'Yes';
        var fl = (f.gwProps && f.gwProps.falseLabel) || 'No';
        compProps.availableValues = [{ code:'true', name:tl }, { code:'false', name:fl }];
        messages[pageId + '.' + fid + '.trueLabel']  = tl;
        messages[pageId + '.' + fid + '.falseLabel'] = fl;
      }

      /* CurrencyInput / NumberField — add min/max */
      if(f.gwProps && f.gwProps.min != null) compProps.minValue = parseFloat(f.gwProps.min);
      if(f.gwProps && f.gwProps.max != null) compProps.maxValue = parseFloat(f.gwProps.max);

      var fieldEntry = {
        id:   fid,
        type: 'field',
        component: jutroInfo.component,
        componentProps: compProps
      };

      /* Skip non-input widgets from fieldset (buttons/labels handled separately) */
      if(jutroInfo.component === 'Button' || jutroInfo.component === 'Element' || jutroInfo.component === 'NotificationElement') {
        /* Add as-is but mark appropriately */
        fieldEntry.type = 'element';
        if(jutroInfo.component === 'NotificationElement') {
          fieldEntry.componentProps = { message: f.label || '' };
        } else if(jutroInfo.component === 'Element') {
          fieldEntry.componentProps = { tag:'p', content: f.label || '' };
        } else {
          fieldEntry.componentProps = { label: f.label || '', onClick:'{{on_'+fid+'_click}}' };
        }
      }

      panelContent.push(fieldEntry);
    });

    content.push({
      id:   panelId,
      type: 'container',
      componentProps: { className: 'gw-panel', title: '{{' + pageId + '.' + panelId + '.title}}' },
      contentLayout: { id:'grid', numberOfColumns:2 },
      content: panelContent
    });
  });

  /* Action buttons */
  var actionContent = [];
  if(scr.backLabel) {
    messages[pageId + '.backBtn'] = scr.backLabel;
    actionContent.push({ id:'backBtn', type:'element', component:'Button',
      componentProps:{ label:'{{'+pageId+'.backBtn}}', type:'secondary', onClick:'{{onBack}}' } });
  }
  if(scr.cta) {
    messages[pageId + '.ctaBtn'] = scr.cta;
    actionContent.push({ id:'ctaBtn', type:'element', component:'Button',
      componentProps:{ label:'{{'+pageId+'.ctaBtn}}', type:'primary', onClick:'{{onContinue}}' } });
  }
  if(actionContent.length) {
    content.push({ id:'actionBar', type:'container',
      componentProps:{ className:'gw-action-bar' }, content:actionContent });
  }

  var metadata = {
    name: pageId,
    componentMap: {}
  };
  metadata.componentMap[pageId] = {
    id: pageId,
    type: 'container',
    contentLayout: { id:'grid' },
    content: content
  };

  return { metadata:metadata, messages:messages, pageId:pageId };
}

/* ── Build React component scaffold ─────────────── */
function _buildReactComponent(pageId, journeyName) {
  return [
    "import React from 'react';",
    "import { MetadataContent, useMetadata } from '@jutro/uiconfig';",
    "import metadata from './metadata.json';",
    "import messages from './messages.json';",
    "",
    "/**",
    " * " + pageId,
    " * Auto-generated by AI Journey Studio — " + journeyName,
    " * TODO: Wire up onBack / onContinue handlers and data bindings",
    " */",
    "export function " + pageId + "() {",
    "  const { resolveCallbackMap } = useMetadata();",
    "",
    "  const callbackMap = resolveCallbackMap({",
    "    onBack: () => { /* TODO: navigate back */ },",
    "    onContinue: () => { /* TODO: validate and advance */ },",
    "  });",
    "",
    "  return (",
    "    <MetadataContent",
    "      metadata={metadata}",
    "      callbackMap={callbackMap}",
    "      uiProps={metadata.componentMap." + pageId + "}",
    "    />",
    "  );",
    "}",
    "",
    "export default " + pageId + ";",
    ""
  ].join('\n');
}

/* ── Simple ZIP builder (no external lib) ────────── */
/* Uses a minimal ZIP implementation sufficient for text files */
function _buildZip(files) {
  /* files: [{name, content (string)}] */
  /* Returns a Blob */

  function crc32(str) {
    var crc = 0xFFFFFFFF;
    for(var i=0;i<str.length;i++){
      var byte = str.charCodeAt(i) & 0xFF;
      for(var j=0;j<8;j++){
        if((crc ^ byte) & 1) crc = (crc >>> 1) ^ 0xEDB88320;
        else crc >>>= 1;
        byte >>>= 1;
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function toBytes(str) {
    var bytes = [];
    for(var i=0;i<str.length;i++) bytes.push(str.charCodeAt(i) & 0xFF);
    return bytes;
  }

  function uint16le(n) { return [n & 0xFF, (n>>8) & 0xFF]; }
  function uint32le(n) { return [n&0xFF,(n>>8)&0xFF,(n>>16)&0xFF,(n>>24)&0xFF]; }

  var localHeaders = [];
  var centralHeaders = [];
  var offset = 0;

  files.forEach(function(file){
    var nameBytes  = toBytes(file.name);
    var dataBytes  = toBytes(file.content);
    var crc        = crc32(file.content);
    var size       = dataBytes.length;

    /* Local file header */
    var lh = [0x50,0x4B,0x03,0x04] // sig
      .concat(uint16le(20))   // version needed
      .concat(uint16le(0))    // flags
      .concat(uint16le(0))    // compression (stored)
      .concat(uint16le(0))    // mod time
      .concat(uint16le(0))    // mod date
      .concat(uint32le(crc))
      .concat(uint32le(size))
      .concat(uint32le(size))
      .concat(uint16le(nameBytes.length))
      .concat(uint16le(0))   // extra len
      .concat(nameBytes)
      .concat(dataBytes);

    /* Central directory entry */
    var cd = [0x50,0x4B,0x01,0x02]
      .concat(uint16le(20))  // version made
      .concat(uint16le(20))  // version needed
      .concat(uint16le(0))   // flags
      .concat(uint16le(0))   // compression
      .concat(uint16le(0))   // mod time
      .concat(uint16le(0))   // mod date
      .concat(uint32le(crc))
      .concat(uint32le(size))
      .concat(uint32le(size))
      .concat(uint16le(nameBytes.length))
      .concat(uint16le(0))   // extra len
      .concat(uint16le(0))   // comment len
      .concat(uint16le(0))   // disk start
      .concat(uint16le(0))   // int attribs
      .concat(uint32le(0))   // ext attribs
      .concat(uint32le(offset))
      .concat(nameBytes);

    localHeaders.push(lh);
    centralHeaders.push(cd);
    offset += lh.length;
  });

  var cdOffset = offset;
  var cdSize = centralHeaders.reduce(function(s,c){ return s+c.length; }, 0);

  /* End of central directory */
  var eocd = [0x50,0x4B,0x05,0x06]
    .concat(uint16le(0))   // disk number
    .concat(uint16le(0))   // cd disk
    .concat(uint16le(files.length))
    .concat(uint16le(files.length))
    .concat(uint32le(cdSize))
    .concat(uint32le(cdOffset))
    .concat(uint16le(0));  // comment len

  var all = [];
  localHeaders.forEach(function(lh){ all = all.concat(lh); });
  centralHeaders.forEach(function(cd){ all = all.concat(cd); });
  all = all.concat(eocd);

  return new Blob([new Uint8Array(all)], {type:'application/zip'});
}

/* ── Main export function ────────────────────────── */
function downloadJutroExport() {
  if(!S.journey || !S.screens || !S.screens.length){
    toast('No journey to export'); return;
  }

  var journeyName = S.journey.name || 'journey';
  var files = [];

  /* README */
  var readme = [
    '# Jutro Scaffold — ' + journeyName,
    '',
    'Auto-generated by AI Journey Studio.',
    '',
    '## Structure',
    'Each screen gets its own folder:',
    '  [ScreenName]Page/',
    '    metadata.json        — Jutro UI metadata definition',
    '    [ScreenName]Page.jsx — React component scaffold',
    '    messages.json        — i18n message keys',
    '',
    '## Getting started',
    '1. Copy each [ScreenName]Page/ folder into your Jutro pages directory',
    '2. Fill in the data model paths (search for TODO in .jsx files)',
    '3. Register pages in your router',
    '4. Replace placeholder typekey codes with real entity values if needed',
    '',
    '## Generated screens',
    S.screens.map(function(s){ return '- ' + s.name; }).join('\n'),
  ].join('\n');

  files.push({ name:'README.md', content:readme });

  /* Generate files for each screen */
  S.screens.forEach(function(scr){
    var result  = _buildMetadata(scr, journeyName);
    var pageId  = result.pageId;
    var folder  = pageId + '/';

    files.push({
      name:    folder + 'metadata.json',
      content: JSON.stringify(result.metadata, null, 2)
    });
    files.push({
      name:    folder + pageId + '.jsx',
      content: _buildReactComponent(pageId, journeyName)
    });
    files.push({
      name:    folder + 'messages.json',
      content: JSON.stringify(result.messages, null, 2)
    });
  });

  /* Build ZIP and trigger download */
  var zipBlob   = _buildZip(files);
  var slugName  = (journeyName || 'journey').replace(/\s+/g,'-').toLowerCase();
  var a = document.createElement('a');
  a.href = URL.createObjectURL(zipBlob);
  a.download = slugName + '-jutro-scaffold.zip';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 100);
  toast('Jutro scaffold downloaded ✓');
}
