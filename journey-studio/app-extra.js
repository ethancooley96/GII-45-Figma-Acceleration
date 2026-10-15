/* AI Journey Studio — app-extra.js */

/* ─── Tabs ─────────────────────────────────────────── */
var _tab = 'builder';
function switchTab(btn) {
  _tab = btn.getAttribute('data-tab');
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  btn.classList.add('active');
  _updateTab();
}
function _updateTab() {
  ['builder','fields','preview','json'].forEach(function(t){
    var e = $id('tab-'+t); if(e) e.style.display = (t===_tab ? '' : 'none');
  });
  if(_tab==='preview') renderPreview();
  if(_tab==='json') renderJSON();
}

/* ─── Preview ─────────────────────────────────────── */

/* ─── Fields layout view state ───────────────────── */
var _fieldsView = 'list';
var _pcfBadgeMode = false;

function switchFieldsView(v) {
  _fieldsView = v;
  document.querySelectorAll('.fields-view-btn').forEach(function(b){ b.classList.remove('active'); });
  var btn = document.querySelector('.fields-view-btn[data-view="'+v+'"]');
  if(btn) btn.classList.add('active');
  var listWrap   = document.getElementById('fieldsListWrap');
  var layoutWrap = document.getElementById('fieldScreenLayout');
  var addBtn     = document.getElementById('fieldsAddBtn');
  if(listWrap)   listWrap.style.display   = (v === 'list'   ? '' : 'none');
  if(layoutWrap) layoutWrap.style.display = (v === 'layout' ? '' : 'none');
  if(addBtn) addBtn.style.display = (v === 'list' ? '' : 'none');
  if(v === 'layout') renderFieldsScreenLayout();
}

/* ═══════════════════════════════════════════════════
   GW WIDGET DESIGNER
   ═══════════════════════════════════════════════════ */

var _GW_WIDGETS = [
  { gwWidget:'Input',            category:'inputs',  icon:'T',   label:'Input',         htmlType:'text',     jutro:'TextInput' },
  { gwWidget:'TextInput',        category:'inputs',  icon:'Aa',  label:'TextInput',      htmlType:'text',     jutro:'TextInput' },
  { gwWidget:'TypeKeyInput',     category:'inputs',  icon:'☰',  label:'TypeKeyInput',   htmlType:'select',   jutro:'Select' },
  { gwWidget:'DateInput',        category:'inputs',  icon:'📅', label:'DateInput',      htmlType:'date',     jutro:'DatePickerSingle' },
  { gwWidget:'CurrencyInput',    category:'inputs',  icon:'£',   label:'CurrencyInput',  htmlType:'number',   jutro:'CurrencyField' },
  { gwWidget:'IntegerInput',     category:'inputs',  icon:'#',   label:'IntegerInput',   htmlType:'number',   jutro:'NumberField' },
  { gwWidget:'BooleanRadioInput',category:'inputs',  icon:'◉',  label:'BooleanRadio',   htmlType:'radio',    jutro:'RadioButtonField' },
  { gwWidget:'RangeInput',       category:'inputs',  icon:'≡',   label:'RangeInput',     htmlType:'select',   jutro:'Select' },
  { gwWidget:'TextAreaInput',    category:'inputs',  icon:'¶',   label:'TextAreaInput',  htmlType:'textarea', jutro:'TextArea' },
  { gwWidget:'EmailInput',       category:'inputs',  icon:'✉',  label:'EmailInput',     htmlType:'email',    jutro:'TextInput' },
  { gwWidget:'PhoneInput',       category:'inputs',  icon:'☎',  label:'PhoneInput',     htmlType:'tel',      jutro:'TextInput' },
  { gwWidget:'PasswordInput',    category:'inputs',  icon:'🔒', label:'PasswordInput',  htmlType:'password', jutro:'PasswordField' },
  { gwWidget:'ButtonInput',      category:'actions', icon:'▶',  label:'ButtonInput',    htmlType:'button',   jutro:'Button' },
  { gwWidget:'ToolbarButton',    category:'actions', icon:'⬛', label:'ToolbarButton',  htmlType:'button',   jutro:'Button' },
  { gwWidget:'DirectInvokeInput',category:'actions', icon:'↗',  label:'DirectInvoke',   htmlType:'button',   jutro:'Button' },
  { gwWidget:'Label',            category:'display', icon:'L',   label:'Label',          htmlType:'label',    jutro:'FieldLabel' },
  { gwWidget:'AlertBar',         category:'display', icon:'!',   label:'AlertBar',       htmlType:'alert',    jutro:'InlineNotification' }
];

var _GW_CATEGORIES = [
  { key:'inputs',  title:'Inputs' },
  { key:'actions', title:'Actions' },
  { key:'display', title:'Display' }
];

function _gwWidgetInfo(gwWidget) {
  for(var i=0;i<_GW_WIDGETS.length;i++){
    if(_GW_WIDGETS[i].gwWidget === gwWidget) return _GW_WIDGETS[i];
  }
  return _GW_WIDGETS[0];
}

function _gwHtmlType(f) {
  if(f.gwWidget) return _gwWidgetInfo(f.gwWidget).htmlType;
  return f.type || 'text';
}

/* ─── 3-panel PCF designer state ─────────────────── */
var _pcf3SelField = null;
var _pcf3DragSrc  = null;
var _pcf3Collapsed = {};

function renderFieldsScreenLayout() {
  var el = document.getElementById('fieldScreenLayout'); if(!el) return;
  var s = cur();
  if(!s) {
    el.innerHTML = '<p class="gw-empty-hint">Select a screen to open the designer.</p>';
    return;
  }
  el.innerHTML =
    '<div class="pcf3" id="pcf3Root">' +
      '<div class="pcf3-tree" id="pcf3Tree">'   + _renderPcf3Tree(s)    + '</div>' +
      '<div class="pcf3-canvas">'                                                  +
        '<div class="pcf3-chrome">'              + _renderPcf3Chrome(s)  + '</div>' +
        '<div class="pcf3-canvas-scroll" id="pcf3Canvas">'                        +
          '<div class="pcf3-canvas-body" id="pcf3Body">' + _renderPcf3Panels(s) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pcf3-toolbox" id="pcf3Toolbox">' + _renderPcf3Toolbox() + '</div>' +
    '</div>';
  _pcf3AttachDnd();
}

function _renderPcf3Tree(s) {
  var fields = s.fields || [];
  var panels = []; var panelMap = {};
  fields.forEach(function(f){
    var sec = f.section || s.name || 'Details';
    if(!panelMap[sec]){ panelMap[sec]=[]; panels.push(sec); }
    panelMap[sec].push(f);
  });
  (s._extraPanels||[]).forEach(function(p){ if(!panelMap[p]){ panels.push(p); panelMap[p]=[]; } });
  if(!panels.length) panels = [s.name||'Details'];

  var html = '<div class="pcf3-tree-header">Structure</div><div class="pcf3-tree-body">';
  html += '<div class="pcf3-node pcf3-node-screen"><span class="pcf3-node-icon">&#x229E;</span><span class="pcf3-node-label">'+esc(s.name)+'</span><span class="pcf3-node-tag">Screen</span></div>';
  panels.forEach(function(pname){
    var collapsed = !!_pcf3Collapsed[pname];
    var tog = collapsed ? '&#9654;' : '&#9660;';
    html += '<div class="pcf3-node pcf3-node-panel" onclick="pcf3TogglePanel(\''+pname.replace(/'/g,"\\'")+'\')">' +
      '<span class="pcf3-node-toggle">'+tog+'</span><span class="pcf3-node-icon">&#9638;</span>' +
      '<span class="pcf3-node-label">'+esc(pname)+'</span><span class="pcf3-node-tag">InputSet</span></div>';
    if(!collapsed){
      (panelMap[pname]||[]).forEach(function(f){
        var info = _gwWidgetInfo(f.gwWidget||'Input');
        var sel  = f.id===_pcf3SelField ? ' selected' : '';
        html += '<div class="pcf3-node pcf3-node-field'+sel+'" onclick="pcf3SelectField(\''+f.id+'\')">' +
          '<span class="pcf3-node-icon">'+info.icon+'</span>' +
          '<span class="pcf3-node-label">'+esc(f.label||'Field')+'</span>' +
          '<span class="pcf3-node-tag">'+esc(f.gwWidget||'Input')+'</span></div>';
      });
    }
  });
  html += '</div>';
  return html;
}

function _renderPcf3Chrome(s) {
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var journeyName = (S.journey&&S.journey.name)?esc(S.journey.name):'Journey';
  return '<div class="pcf3-chrome-datebar">'+dateStr+'</div>' +
    '<div class="pcf3-chrome-titlerow">' +
      '<h2 class="pcf3-chrome-title">'+esc(s.name)+'</h2>' +
      '<span class="pcf3-chrome-upto">Up to '+journeyName+'</span>' +
    '</div>' +
    '<div class="pcf3-chrome-toolbar">' +
      '<button class="pcf3-chrome-btn primary">Edit</button>' +
      '<button class="pcf3-chrome-btn">Cancel</button>' +
      '<button class="pcf3-chrome-btn" onclick="gwOpenAddPanel()" style="margin-left:auto">+ Add Panel</button>' +
    '</div>';
}

function _renderPcf3Panels(s) {
  var fields = s.fields || [];
  var panels = []; var panelMap = {};
  fields.forEach(function(f){
    var sec = f.section||s.name||'Details';
    if(!panelMap[sec]){ panelMap[sec]=[]; panels.push(sec); }
    panelMap[sec].push(f);
  });
  (s._extraPanels||[]).forEach(function(p){ if(!panelMap[p]){ panels.push(p); panelMap[p]=[]; } });
  if(!panels.length) panels = [s.name||'Details'];
  var html = '';
  panels.forEach(function(pname){
    html += _renderPcf3Panel(pname, panelMap[pname]||[], s);
  });
  return html;
}

function _renderPcf3Panel(panelName, fields, s) {
  var safe = panelName.replace(/'/g, "\\'");
  var collapsed = !!_pcf3Collapsed[panelName];
  var html =
    '<div class="gw-panel2' + (collapsed ? ' gw-panel2-collapsed' : '') + '" data-panel="' + esc(panelName) + '">' +
    '<div class="gw-panel2-header">' +
      '<button class="gw-panel2-collapse-btn" onclick="pcf3TogglePanel(\'' + safe + '\')">' + (collapsed ? '&#9654;' : '&#9660;') + '</button>' +
      '<span class="gw-panel2-title">' + esc(panelName) + '</span>' +
      '<span class="gw-panel2-tag">InputSet</span>' +
      '<div class="gw-panel2-hdr-actions">' +
        '<button class="gw-panel2-btn" onclick="event.stopPropagation();gwOpenRenamePanel(\'' + safe + '\')">&#x270E; Rename</button>' +
        '<button class="gw-panel2-btn danger" onclick="event.stopPropagation();gwDeletePanel(\'' + safe + '\')">&#x1F5D1;</button>' +
      '</div>' +
    '</div>';
  if (!collapsed) {
    html += '<div class="gw-panel2-body" data-pcf3-panel="' + esc(panelName) + '"' +
      ' ondragover="pcf3GridDragOver(event)" ondragleave="pcf3GridDragLeave(event)" ondrop="pcf3GridDrop(event)">';
    if (!fields.length) {
      html += '<div class="gw-panel2-empty">Drop a widget here, or click any toolbox item to add it to this panel</div>';
    } else {
      html += '<div class="gw-panel2-grid">';
      fields.forEach(function(f, idx) { html += _renderPcf3Card(f, idx, panelName); });
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function _renderPcf3Card(f, idx, panelName) {
  var info    = _gwWidgetInfo(f.gwWidget || 'Input');
  var selCls  = f.id === _pcf3SelField ? ' pcf3-card-selected' : '';
  var ro      = (f.gwProps && f.gwProps.readOnly);
  var req     = f.required ? '<span class="gw-card-req">*</span>' : '';
  var roTag   = ro ? '<span class="gw-card-ro">read-only</span>' : '';
  var safeFid = f.id.replace(/'/g, "\\'");
  var safePan = panelName.replace(/'/g, "\\'");
  var wide    = (f.gwWidget === 'TextAreaInput' || f.gwWidget === 'AlertBar') ? ' pcf3-card-wide' : '';
  return (
    '<div class="pcf3-card' + selCls + wide + '" data-id="' + f.id + '" data-idx="' + idx + '"' +
    ' draggable="true" onclick="pcf3SelectField(\'' + safeFid + '\')"' +
    ' ondragstart="pcf3CardDragStart(event,\'' + safeFid + '\',\'' + safePan + '\')"' +
    ' ondragend="pcf3CardDragEnd(event)"' +
    ' ondragover="event.preventDefault()" ondrop="pcf3CardDrop(event,\'' + safeFid + '\',\'' + safePan + '\')">' +
      '<div class="pcf3-card-top">' +
        '<span class="pcf3-card-icon">' + info.icon + '</span>' +
        '<span class="pcf3-card-widget">' + esc(f.gwWidget || 'Input') + '</span>' +
        roTag +
        '<button class="pcf3-card-edit-btn" onclick="event.stopPropagation();gwOpenWidgetProps(\'' + safeFid + '\')">&#x270E;</button>' +
        '<button class="pcf3-card-del-btn" onclick="event.stopPropagation();pcf3DeleteField(\'' + safeFid + '\')">&#x2715;</button>' +
      '</div>' +
      '<div class="pcf3-card-label">' + esc(f.label || 'Unlabelled') + req + '</div>' +
      _renderPcf3MiniField(f) +
    '</div>'
  );
}

function _renderPcf3MiniField(f) {
  var ht = _gwHtmlType(f);
  if (ht === 'select')    return '<select class="pcf3-mini-input" disabled><option>' + esc(f.placeholder || 'Select…') + '</option></select>';
  if (ht === 'textarea')  return '<textarea class="pcf3-mini-input" disabled placeholder="' + esc(f.placeholder || '') + '"></textarea>';
  if (ht === 'radio')     return '<div class="pcf3-mini-radio"><label><input type="radio" disabled> Yes</label><label><input type="radio" disabled> No</label></div>';
  if (ht === 'button')    return '<button class="pcf3-mini-btn" disabled>' + esc(f.label || 'Button') + '</button>';
  if (ht === 'label')     return '<p class="pcf3-mini-label">' + esc(f.label || 'Label text') + '</p>';
  if (ht === 'alert')     return '<div class="pcf3-mini-alert">&#9888; ' + esc(f.label || 'Alert') + '</div>';
  return '<input class="pcf3-mini-input" type="' + ht + '" placeholder="' + esc(f.placeholder || '') + '" disabled>';
}

function _renderPcf3Toolbox() {
  var html = '<div class="pcf3-toolbox-header">Widgets</div>';
  _GW_CATEGORIES.forEach(function(cat) {
    html += '<div class="pcf3-toolbox-group"><div class="pcf3-toolbox-group-title">' + cat.title + '</div>';
    _GW_WIDGETS.filter(function(w){ return w.category === cat.key; }).forEach(function(w) {
      html += '<div class="pcf3-toolbox-item" draggable="true"' +
        ' onclick="pcf3ToolboxAdd(\'' + w.gwWidget + '\')"' +
        ' ondragstart="pcf3ToolboxDragStart(event,\'' + w.gwWidget + '\')">' +
        '<span class="pcf3-toolbox-icon">' + w.icon + '</span>' +
        '<span class="pcf3-toolbox-label">' + w.label + '</span>' +
        '</div>';
    });
    html += '</div>';
  });
  return html;
}

/* ─── PCF3 interactions ───────────────────────────── */

function pcf3SelectField(id) {
  _pcf3SelField = (_pcf3SelField === id) ? null : id;
  renderFieldsScreenLayout();
}

function pcf3TogglePanel(name) {
  _pcf3Collapsed[name] = !_pcf3Collapsed[name];
  renderFieldsScreenLayout();
}

function pcf3DeleteField(id) {
  var s = cur(); if(!s) return;
  s.fields = s.fields.filter(function(f){ return f.id !== id; });
  if(_pcf3SelField === id) _pcf3SelField = null;
  renderFieldsScreenLayout(); markDirty();
}

/* ─── Toolbox drag & drop ─────────────────────────── */
var _pcf3ToolboxDragWidget = null;

function pcf3ToolboxDragStart(e, gwWidget) {
  _pcf3ToolboxDragWidget = gwWidget;
  _pcf3DragSrc = null;
  e.dataTransfer.effectAllowed = 'copy';
}

function pcf3ToolboxAdd(gwWidget) {
  var s = cur(); if(!s) return;
  /* Add to the first visible panel or default panel */
  var panels = []; var panelMap = {};
  (s.fields||[]).forEach(function(f){ var sec=f.section||s.name||'Details'; if(!panelMap[sec]){ panelMap[sec]=true; panels.push(sec); } });
  (s._extraPanels||[]).forEach(function(p){ if(!panelMap[p]){ panels.push(p); panelMap[p]=true; } });
  var targetPanel = panels[0] || s.name || 'Details';
  var info = _gwWidgetInfo(gwWidget);
  var nf = { id:uid(), label:info.label, gwWidget:gwWidget, type:info.htmlType, required:false, placeholder:'', helpText:'', section:targetPanel, gwProps:{} };
  if(!s.fields) s.fields=[];
  s.fields.push(nf);
  renderFieldsScreenLayout(); markDirty();
}

/* ─── Card drag & drop ────────────────────────────── */
function pcf3CardDragStart(e, id, panel) {
  _pcf3DragSrc = { id:id, panel:panel };
  _pcf3ToolboxDragWidget = null;
  e.dataTransfer.effectAllowed = 'move';
}
function pcf3CardDragEnd(e) { /* styling reset handled by re-render */ }

function pcf3GridDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = (_pcf3DragSrc) ? 'move' : 'copy';
  e.currentTarget.classList.add('pcf3-drop-target');
}
function pcf3GridDragLeave(e) {
  e.currentTarget.classList.remove('pcf3-drop-target');
}
function pcf3GridDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('pcf3-drop-target');
  var targetPanel = e.currentTarget.getAttribute('data-pcf3-panel');
  if(!targetPanel) return;
  var s = cur(); if(!s) return;
  if(_pcf3ToolboxDragWidget) {
    /* Drop from toolbox */
    var info = _gwWidgetInfo(_pcf3ToolboxDragWidget);
    var nf = { id:uid(), label:info.label, gwWidget:_pcf3ToolboxDragWidget, type:info.htmlType, required:false, placeholder:'', helpText:'', section:targetPanel, gwProps:{} };
    if(!s.fields) s.fields=[];
    s.fields.push(nf);
    _pcf3ToolboxDragWidget = null;
  } else if(_pcf3DragSrc) {
    /* Move existing card between panels */
    var fld = s.fields.find(function(f){ return f.id===_pcf3DragSrc.id; });
    if(fld) fld.section = targetPanel;
    _pcf3DragSrc = null;
  }
  renderFieldsScreenLayout(); markDirty();
}

function pcf3CardDrop(e, targetId, targetPanel) {
  e.preventDefault(); e.stopPropagation();
  e.currentTarget.classList.remove('pcf3-drop-target');
  var s = cur(); if(!s) return;
  if(_pcf3DragSrc && _pcf3DragSrc.id !== targetId) {
    /* Reorder within / across panels */
    var srcIdx = s.fields.findIndex(function(f){ return f.id===_pcf3DragSrc.id; });
    var tgtIdx = s.fields.findIndex(function(f){ return f.id===targetId; });
    if(srcIdx>-1 && tgtIdx>-1) {
      var moved = s.fields.splice(srcIdx,1)[0];
      moved.section = targetPanel;
      s.fields.splice(tgtIdx,0,moved);
    }
    _pcf3DragSrc = null;
    renderFieldsScreenLayout(); markDirty();
  }
}

function _pcf3AttachDnd() { /* drag events are inline, nothing extra needed */ }

/* ─── Panel management ────────────────────────────── */
function gwOpenAddPanel() {
  var t = $id('gwPanelModalTitle'); if(t) t.textContent='Add Panel';
  setVal('gwPanelModal-name',''); setVal('gwPanelModal-oldName','');
  openModal('gwPanelModal');
}
function gwOpenRenamePanel(name) {
  var t = $id('gwPanelModalTitle'); if(t) t.textContent='Rename Panel';
  setVal('gwPanelModal-name', name); setVal('gwPanelModal-oldName', name);
  openModal('gwPanelModal');
}
function gwSavePanel() {
  var newName = getVal('gwPanelModal-name').trim();
  if(!newName){ toast('Enter a panel name'); return; }
  var oldName = getVal('gwPanelModal-oldName').trim();
  var s = cur(); if(!s) return;
  if(oldName && oldName !== newName) {
    /* Rename: update all fields in that section */
    (s.fields||[]).forEach(function(f){ if(f.section===oldName) f.section=newName; });
    if(s._extraPanels) { var i=s._extraPanels.indexOf(oldName); if(i>-1) s._extraPanels[i]=newName; }
  } else if(!oldName) {
    /* Add new empty panel */
    if(!s._extraPanels) s._extraPanels=[];
    if(!s._extraPanels.includes(newName)) s._extraPanels.push(newName);
  }
  closeModal('gwPanelModal');
  renderFieldsScreenLayout(); markDirty();
  toast('Panel saved');
}
function gwDeletePanel(name) {
  if(!confirm('Delete panel "'+name+'" and all its fields?')) return;
  var s = cur(); if(!s) return;
  s.fields = (s.fields||[]).filter(function(f){ return f.section !== name; });
  if(s._extraPanels) s._extraPanels = s._extraPanels.filter(function(p){ return p !== name; });
  renderFieldsScreenLayout(); markDirty(); toast('Panel deleted');
}

/* ─── Widget props modal ──────────────────────────── */
function gwOpenWidgetProps(fieldId) {
  var s = cur(); if(!s) return;
  var f = (s.fields||[]).find(function(x){ return x.id===fieldId; });
  if(!f) return;
  setVal('gwModal-fieldId', f.id);
  setVal('gwModal-gwWidget', f.gwWidget||'Input');
  setVal('gwModal-label', f.label||'');
  setVal('gwModal-section', f.section||'');
  setVal('gwModal-placeholder', f.placeholder||'');
  setVal('gwModal-helpText', f.helpText||'');
  var reqEl = $id('gwModal-required'); if(reqEl) reqEl.checked = !!f.required;
  var roEl  = $id('gwModal-readOnly');  if(roEl)  roEl.checked  = !!(f.gwProps&&f.gwProps.readOnly);
  var t = $id('gwModalTitle'); if(t) t.textContent = 'Edit Widget: '+(f.label||f.gwWidget||'Field');
  gwModalWidgetTypeChanged();
  openModal('gwWidgetModal');
}
function gwModalWidgetTypeChanged() {
  var extra = $id('gwModal-extra'); if(!extra) return;
  var wtype = getVal('gwModal-gwWidget');
  var html = '';
  if(wtype==='TypeKeyInput'||wtype==='RangeInput') {
    html += '<label class="label" style="grid-column:1/-1">Type Key / Enum Values (comma-separated)<input id="gwModal-typeKey" placeholder="e.g. ACTIVE,INACTIVE,PENDING"></label>';
  }
  if(wtype==='BooleanRadioInput') {
    html += '<label class="label">True Label<input id="gwModal-trueLabel" placeholder="Yes"></label>';
    html += '<label class="label">False Label<input id="gwModal-falseLabel" placeholder="No"></label>';
  }
  if(wtype==='CurrencyInput'||wtype==='IntegerInput') {
    html += '<label class="label">Min Value<input id="gwModal-min" type="number" placeholder="0"></label>';
    html += '<label class="label">Max Value<input id="gwModal-max" type="number" placeholder=""></label>';
  }
  if(wtype==='ButtonInput'||wtype==='ToolbarButton'||wtype==='DirectInvokeInput') {
    html += '<label class="label" style="grid-column:1/-1">Action / Event Name<input id="gwModal-action" placeholder="e.g. submit, goBack"></label>';
  }
  extra.innerHTML = html;
  /* Restore saved gwProps values */
  var s = cur(); if(!s) return;
  var fid = getVal('gwModal-fieldId');
  var f = (s.fields||[]).find(function(x){ return x.id===fid; }); if(!f||!f.gwProps) return;
  var gp = f.gwProps;
  if($id('gwModal-typeKey'))    setVal('gwModal-typeKey',   gp.typeKey   ||'');
  if($id('gwModal-trueLabel'))  setVal('gwModal-trueLabel', gp.trueLabel ||'');
  if($id('gwModal-falseLabel')) setVal('gwModal-falseLabel',gp.falseLabel||'');
  if($id('gwModal-min'))        setVal('gwModal-min',       gp.min       ||'');
  if($id('gwModal-max'))        setVal('gwModal-max',       gp.max       ||'');
  if($id('gwModal-action'))     setVal('gwModal-action',    gp.action    ||'');
}
function gwSaveWidget() {
  var fid = getVal('gwModal-fieldId');
  var s = cur(); if(!s) return;
  var f = (s.fields||[]).find(function(x){ return x.id===fid; }); if(!f) return;
  f.gwWidget    = getVal('gwModal-gwWidget');
  f.label       = getVal('gwModal-label');
  f.section     = getVal('gwModal-section');
  f.placeholder = getVal('gwModal-placeholder');
  f.helpText    = getVal('gwModal-helpText');
  f.required    = !!($id('gwModal-required')&&$id('gwModal-required').checked);
  f.type        = _gwWidgetInfo(f.gwWidget).htmlType;
  if(!f.gwProps) f.gwProps={};
  f.gwProps.readOnly  = !!($id('gwModal-readOnly')&&$id('gwModal-readOnly').checked);
  if($id('gwModal-typeKey'))    f.gwProps.typeKey    = getVal('gwModal-typeKey');
  if($id('gwModal-trueLabel'))  f.gwProps.trueLabel  = getVal('gwModal-trueLabel');
  if($id('gwModal-falseLabel')) f.gwProps.falseLabel = getVal('gwModal-falseLabel');
  if($id('gwModal-min'))        f.gwProps.min        = getVal('gwModal-min');
  if($id('gwModal-max'))        f.gwProps.max        = getVal('gwModal-max');
  if($id('gwModal-action'))     f.gwProps.action     = getVal('gwModal-action');
  closeModal('gwWidgetModal');
  renderFieldsScreenLayout(); renderFields(); markDirty(); toast('Widget saved');
}

/* ═══════════════════════════════════════════════════
   AI GENERATE (overridden by app-ai-patch.js)
   ═══════════════════════════════════════════════════ */
var _aiMode = 'journey'; /* kept for legacy compatibility only */


function aiGenerate() {
  var prompt = ($id('ai-prompt')||{value:''}).value.trim();
  if(!prompt){ toast('Enter a prompt first'); return; }

  /* ── Auto-create a journey if none exists ── */
  if(!S.journey) {
    S.journey = { name:'My Journey', product:'', team:'', goal:'', createdAt:new Date().toISOString() };
    S.screens = []; S.cur = null;
    _enableUI(); showWelcome(); markDirty();
  }

  /* ── For PCF mode, ensure there is a current screen ── */
  if(_aiMode === 'pcf' && !S.cur) {
    var autoScr = { id:uid(), name:'New Screen', type:'form', step:S.screens.length+1,
      description:'', cta:'', backLabel:'', errorMessage:'', notes:'',
      fields:[], navigation:{onSuccess:'',onBack:'',onError:'',onSkip:''},
      accessibility:{pageTitle:'New Screen'} };
    S.screens.push(autoScr); S.cur = autoScr.id;
    renderList(); showEditor(autoScr); markDirty();
  }

  /* ── Edit mode requires an existing screen to be selected ── */
  if(_aiMode === 'edit' && !S.cur) {
    toast('Select a screen to edit first');
    return;
  }

  var apiKey   = (S.settings&&S.settings.apiKey)   || localStorage.getItem('aijs_apiKey')   || '';
  var provider = 'openrouter';
  var model    = (S.settings&&S.settings.model)    || localStorage.getItem('aijs_model')    || 'anthropic/claude-sonnet-5.5';
  var maxScr   = parseInt((S.settings&&S.settings.maxScreens)||localStorage.getItem('aijs_maxScreens')||'3');

  if(!apiKey){ toast('Add an API key in ⚙ Settings first'); openSettingsModal(); return; }

  var aiBtn = $id('aiBtn');
  if(aiBtn){ aiBtn.disabled=true; aiBtn.textContent='Generating…'; }

  var systemPrompt, userPrompt;
  if(_aiMode === 'pcf') {
    var s = cur();
    systemPrompt = 'You are a Guidewire PCF screen designer. Given a description, return a JSON array of widget objects. Each object must have: label (string), gwWidget (one of: Input, TextInput, TypeKeyInput, DateInput, CurrencyInput, IntegerInput, BooleanRadioInput, RangeInput, TextAreaInput, EmailInput, PhoneInput, PasswordInput, ButtonInput, ToolbarButton, DirectInvokeInput, Label, AlertBar), required (boolean), placeholder (string), helpText (string), section (panel name string). Return ONLY the JSON array, no markdown.';
    userPrompt = 'Screen name: '+(s?s.name:'New Screen')+'\nDescription: '+prompt;
  } else if(_aiMode === 'edit') {
    var s = cur();
    systemPrompt = 'You are a UX journey designer editing an EXISTING screen. You will be given the current screen as JSON and a request describing the changes to make. Return ONLY the complete UPDATED screen as a single JSON OBJECT (not an array), using the exact same shape: name (string), type (one of: form, confirmation, info, list, dashboard, error), step (number), description (string), cta (string), backLabel (string), errorMessage (string), notes (string), fields (array of {label,type,required,placeholder,helpText,section}), navigation ({onSuccess,onBack,onError,onSkip}). Preserve any existing values that are not affected by the request. Return ONLY the JSON object, no markdown, no explanation.';
    userPrompt = 'Current screen JSON:\n'+JSON.stringify(s, null, 2)+'\n\nRequested changes:\n'+prompt;
  } else {
    systemPrompt = 'You are a UX journey designer. Given a description, return a JSON array of screen objects (max '+maxScr+'). Each screen must have: name (string), type (one of: form, confirmation, info, list, dashboard, error), step (number), description (string), cta (string), backLabel (string), errorMessage (string), notes (string), fields (array of {label,type,required,placeholder,helpText,section}), navigation ({onSuccess,onBack,onError,onSkip}). Return ONLY the JSON array, no markdown.';
    userPrompt = prompt;
  }

  var endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  var headers  = { 'Content-Type':'application/json', 'Authorization':'Bearer '+apiKey, 'HTTP-Referer':'https://alchemy-journey-studio', 'X-Title':'Alchemy Journey Studio' };
  var body     = JSON.stringify({ model:model||'anthropic/claude-sonnet-5.5', messages:[{role:'system',content:systemPrompt},{role:'user',content:userPrompt}], temperature:0.3 });

  fetch(endpoint, { method:'POST', headers:headers, body:body })
    .then(function(r){
      return r.text().then(function(txt){
        var data;
        try { data = JSON.parse(txt); } catch(e) { throw new Error('HTTP '+r.status+': '+txt.slice(0,300)); }
        if(!r.ok || data.error) throw new Error('HTTP '+r.status+' — '+(data.error ? (data.error.message||JSON.stringify(data.error)) : txt.slice(0,300)));
        return data;
      });
    })
    .then(function(data) {
      /* data is already validated above */
      var _noop = false; if(_noop) { /* placeholder */ }
      var text = (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||'';
      /* Strip markdown fences if present (```json ... ``` or ``` ... ```) */
      text = text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();

      if(_aiMode === 'edit') {
        /* Expect a single JSON OBJECT representing the updated screen */
        var objMatch = text.match(/\{[\s\S]*\}/);
        if(!objMatch) throw new Error('No JSON object in response. Raw: '+text.slice(0,200));
        var updated = JSON.parse(objMatch[0]);
        var s = cur(); if(!s){ toast('No screen selected'); return; }
        s.name          = updated.name          || s.name;
        s.type          = updated.type          || s.type;
        s.description   = (updated.description !== undefined) ? updated.description : s.description;
        s.cta           = (updated.cta !== undefined) ? updated.cta : s.cta;
        s.backLabel     = (updated.backLabel !== undefined) ? updated.backLabel : s.backLabel;
        s.errorMessage  = (updated.errorMessage !== undefined) ? updated.errorMessage : s.errorMessage;
        s.notes         = (updated.notes !== undefined) ? updated.notes : s.notes;
        if(Array.isArray(updated.fields)) {
          s.fields = updated.fields.map(function(f){
            return Object.assign({ id:uid(), gwWidget:'Input', gwProps:{} }, f);
          });
        }
        if(updated.navigation) s.navigation = Object.assign({}, s.navigation, updated.navigation);
        if(!s.accessibility) s.accessibility = {};
        s.accessibility.pageTitle = s.name;
        renderList(); showEditor(s); renderFields(); renderFieldsList();
        if(_fieldsView==='layout') renderFieldsScreenLayout();
        toast('Screen updated ✓');
        markDirty();
        return;
      }

      /* Extract first JSON array — also handle object wrapper like {"screens":[...]} */
      var match = text.match(/\[[\s\S]*\]/);
      if(!match) {
        /* Try to find an array inside a wrapper object */
        var objMatch2 = text.match(/\{[\s\S]*\}/);
        if(objMatch2) {
          try {
            var obj = JSON.parse(objMatch2[0]);
            var arrKey = Object.keys(obj).find(function(k){ return Array.isArray(obj[k]); });
            if(arrKey) match = [JSON.stringify(obj[arrKey])];
          } catch(e2) { /* ignore */ }
        }
      }
      if(!match) throw new Error('No JSON array in response. Raw: '+text.slice(0,200));
      var parsed = JSON.parse(match[0]);
      if(_aiMode === 'pcf') {
        var s = cur(); if(!s){ toast('No screen selected'); return; }
        parsed.forEach(function(fw){
          var info = _gwWidgetInfo(fw.gwWidget||'Input');
          s.fields.push({ id:uid(), label:fw.label||'', gwWidget:fw.gwWidget||'Input',
            type:info.htmlType, required:!!fw.required, placeholder:fw.placeholder||'',
            helpText:fw.helpText||'', section:fw.section||(s.name||'Details'), gwProps:{} });
        });
        renderFields(); renderFieldsList();
        if(_fieldsView==='layout') renderFieldsScreenLayout();
        toast('Added '+parsed.length+' widget'+(parsed.length!==1?'s':'')+' ✓');
      } else {
        parsed.forEach(function(sd){
          var scr = { id:uid(), name:sd.name||'Screen', type:sd.type||'form',
            step:sd.step||(S.screens.length+1), description:sd.description||'',
            cta:sd.cta||'', backLabel:sd.backLabel||'', errorMessage:sd.errorMessage||'',
            notes:sd.notes||'',
            fields:(sd.fields||[]).map(function(f){ return Object.assign({id:uid(),gwWidget:'Input',gwProps:{}},f); }),
            navigation:sd.navigation||{onSuccess:'',onBack:'',onError:'',onSkip:''},
            accessibility:{pageTitle:sd.name||'Screen'} };
          S.screens.push(scr);
        });
        renderList();
        if(S.screens.length) openScr(S.screens[S.screens.length-1].id);
        toast('Generated '+parsed.length+' screen'+(parsed.length!==1?'s':'')+' ✓');
      }
      markDirty();
    })
    .catch(function(err){
      _showAiError(err.message);
    })
    .finally(function(){
      if(aiBtn){ aiBtn.disabled=false; aiBtn.textContent='Generate with AI'; }
    });
}

/* ─── Persistent AI error banner ─────────────────── */
function _showAiError(msg) {
  var banner = $id('ai-error-banner');
  if(!banner) {
    /* Create it dynamically if not in HTML yet */
    banner = document.createElement('div');
    banner.id = 'ai-error-banner';
    banner.className = 'ai-error-banner';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'ai-error-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = function(){ _clearAiError(); };
    banner.appendChild(closeBtn);
    var msgEl = document.createElement('span');
    msgEl.id = 'ai-error-msg';
    banner.appendChild(msgEl);
    /* Insert before the AI panel or at top of body */
    var aiPanel = $id('ai-panel') || document.querySelector('.ai-panel') || document.body.firstChild;
    if(aiPanel && aiPanel.parentNode) {
      aiPanel.parentNode.insertBefore(banner, aiPanel);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }
  }
  var msgEl2 = $id('ai-error-msg');
  if(msgEl2) msgEl2.textContent = msg;
  banner.style.display = 'flex';
  /* Also log to console for easy copy */
  console.error('[AI Journey Studio] AI error:', msg);
}
function _clearAiError() {
  var banner = $id('ai-error-banner');
  if(banner) banner.style.display = 'none';
}

/* ═══════════════════════════════════════════════════
   SETTINGS
   ═══════════════════════════════════════════════════ */
function openSettingsModal() {
  var key   = localStorage.getItem('aijs_apiKey')   || '';
  var model = localStorage.getItem('aijs_model')    || 'anthropic/claude-sonnet-5.5';
  var maxS  = localStorage.getItem('aijs_maxScreens')|| '3';
  setVal('settings-api-key',  key);
  setVal('settings-model', model);
  setVal('settings-max-screens', maxS);
  openModal('settingsModal');
}
function settingsChanged() { /* live validation could go here */ }
function toggleKeyVisibility() {
  var inp = $id('settings-api-key'); if(!inp) return;
  inp.type = (inp.type==='password') ? 'text' : 'password';
  var btn = inp.parentNode && inp.parentNode.querySelector('button');
  if(btn) btn.textContent = (inp.type==='password') ? 'Show' : 'Hide';
}
function saveSettings() {
  var key  = getVal('settings-api-key').trim();
  var mdl  = getVal('settings-model');
  var maxS = getVal('settings-max-screens');
  localStorage.setItem('aijs_apiKey',      key);
  localStorage.setItem('aijs_provider',    'openrouter');
  localStorage.setItem('aijs_model',       mdl);
  localStorage.setItem('aijs_maxScreens',  maxS);
  if(!S.settings) S.settings={};
  S.settings.apiKey=key; S.settings.provider='openrouter'; S.settings.model=mdl; S.settings.maxScreens=maxS;
  closeModal('settingsModal'); toast('Settings saved ✓');
}

/* ═══════════════════════════════════════════════════
   RESET / IMPORT / EXPORT
   ═══════════════════════════════════════════════════ */
function resetJourney() {
  if(!confirm('Reset everything? This clears all unsaved work.')) return;
  S.journey=null; S.screens=[]; S.cur=null; S.dirty=false;
  localStorage.removeItem('aijs');
  var sn=$id('sidebarJourneyName'); if(sn) sn.innerHTML='<small>Current Journey</small>No journey loaded';
  var tt=$id('topbarTitle'); if(tt) tt.textContent='Alchemy Journey Studio';
  var ts=$id('topbarSub');   if(ts) ts.textContent='Create or import a journey to get started';
  ['addScreenBtn','topAddScreenBtn','aiBtn'].forEach(function(id){var e=$id(id);if(e)e.disabled=true;});
  renderList(); showWelcome(); markSaved(); toast('Reset ✓');
}

function doExport() {
  if(!S.journey){ toast('No journey to export'); return; }
  var payload = { journey:S.journey, screens:S.screens, exportedAt:new Date().toISOString() };
  var json = JSON.stringify(payload, null, 2);
  var pre = $id('exportJSON'); if(pre) pre.textContent = json;
  var cnt = $id('exportScreenCount'); if(cnt) cnt.textContent = S.screens.length+' screen'+(S.screens.length!==1?'s':'');
  openModal('exportModal');
}
function copyExport() {
  var pre = $id('exportJSON'); if(!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(function(){ toast('Copied ✓'); }).catch(function(){ toast('Copy failed'); });
}
function downloadHandoffJSON() {
  if(!S.journey) return;
  var payload = { journey:S.journey, screens:S.screens, exportedAt:new Date().toISOString() };
  _downloadText(JSON.stringify(payload,null,2), (S.journey.name||'journey').replace(/\s+/g,'-').toLowerCase()+'-handoff.json', 'application/json');
}
function downloadCSS() {
  var lines = ['/* Alchemy Journey Studio — generated CSS */'];
  S.screens.forEach(function(s){
    var cls = '.screen-'+s.id;
    lines.push(cls+' { /* '+s.name+' */ }');
    (s.fields||[]).forEach(function(f){
      lines.push(cls+' .field-'+f.id+' { /* '+f.label+' */ }');
    });
  });
  _downloadText(lines.join('\n'), 'journey-screens.css', 'text/css');
}
function _downloadText(text, filename, mime) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text],{type:mime}));
  a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 100);
}

function importJSON() {
  var inp = document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange = function(e){
    var file = e.target.files[0]; if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){ setVal('importText', ev.target.result); };
    reader.readAsText(file);
  };
  inp.click();
}
var _SAMPLE_JSON = JSON.stringify({
  "journey": {
    "name": "Customer Service Request Journey",
    "product": "", "team": "", "goal": "",
    "createdAt": "2026-09-28T14:00:00.000Z"
  },
  "screens": [
    {
      "id": "screen-001", "name": "Request details", "type": "form", "step": 1,
      "description": "Please provide the information below to continue.",
      "cta": "Continue", "backLabel": "Save and continue later",
      "errorMessage": "", "notes": "",
      "fields": [
        { "id": "field-001", "label": "Customer name",         "gwWidget": "TextInput",     "type": "text",     "required": true,  "placeholder": "", "helpText": "", "section": "Request details", "gwProps": {} },
        { "id": "field-002", "label": "Email address",         "gwWidget": "EmailInput",    "type": "email",    "required": true,  "placeholder": "", "helpText": "", "section": "Request details", "gwProps": {} },
        { "id": "field-003", "label": "Type of request",       "gwWidget": "TypeKeyInput",  "type": "select",   "required": true,  "placeholder": "", "helpText": "", "section": "Request details", "gwProps": { "typeKey": "Billing query,Technical support,Account change,General enquiry" } },
        { "id": "field-004", "label": "Description of request","gwWidget": "TextAreaInput", "type": "textarea", "required": true,  "placeholder": "", "helpText": "", "section": "Request details", "gwProps": {} },
        { "id": "field-005", "label": "Is this request urgent","gwWidget": "TypeKeyInput",  "type": "select",   "required": true,  "placeholder": "", "helpText": "", "section": "Request details", "gwProps": { "typeKey": "Yes,No,Not sure" } },
        { "id": "field-006", "label": "Urgent Request Details", "gwWidget": "TextAreaInput","type": "textarea", "required": true,  "placeholder": "", "helpText": "", "section": "Urgent Request Details", "gwProps": {} }
      ],
      "navigation": { "onSuccess": "screen-002", "onBack": "", "onError": "", "onSkip": "" },
      "accessibility": { "pageTitle": "Request details" }
    },
    {
      "id": "screen-002", "name": "Review request", "type": "form", "step": 2,
      "description": "Please review the details below before submitting your request.",
      "cta": "Continue", "backLabel": "Back",
      "errorMessage": "", "notes": "",
      "fields": [
        { "id": "field-007", "label": "Review confirmation", "gwWidget": "TypeKeyInput", "type": "select", "required": true, "placeholder": "", "helpText": "", "section": "Review request", "gwProps": { "typeKey": "Yes, the details are correct,No, I need to make changes" } }
      ],
      "navigation": { "onSuccess": "screen-003", "onBack": "screen-001", "onError": "", "onSkip": "" },
      "accessibility": { "pageTitle": "Review request" }
    },
    {
      "id": "screen-003", "name": "Request submitted", "type": "confirmation", "step": 3,
      "description": "Your request has been submitted. Please keep your reference number safe.",
      "cta": "Submit", "backLabel": "Back",
      "errorMessage": "", "notes": "",
      "fields": [
        { "id": "field-008", "label": "Confirmation reference", "gwWidget": "TextInput", "type": "text", "required": false, "placeholder": "", "helpText": "", "section": "Request submitted", "gwProps": {} }
      ],
      "navigation": { "onSuccess": "", "onBack": "screen-002", "onError": "", "onSkip": "" },
      "accessibility": { "pageTitle": "Request submitted" }
    }
  ]
}, null, 2);

function loadSample() {
  setVal('importText', _SAMPLE_JSON);
  toast('Sample loaded');
}
function importFromTextarea() {
  var raw = getVal('importText').trim(); if(!raw){ toast('Paste JSON first'); return; }
  try {
    var data = JSON.parse(raw);
    if(data.journey) S.journey = data.journey;
    if(data.screens) {
      S.screens = data.screens.map(function(s){
        if(!s.id) s.id = uid();
        if(!s.fields) s.fields = [];
        s.fields = s.fields.map(function(f){ if(!f.id) f.id=uid(); if(!f.gwProps) f.gwProps={}; return f; });
        return s;
      });
    }
    S.cur = null;
    _enableUI(); renderList(); showWelcome(); markDirty();
    closeModal('importModal'); toast('Imported '+S.screens.length+' screen'+(S.screens.length!==1?'s':'')+' ✓');
  } catch(e){ toast('Invalid JSON: '+e.message); }
}

/* ═══════════════════════════════════════════════════
   PREVIEW & JSON TAB
   ═══════════════════════════════════════════════════ */
/* ─── Preview mode state ─────────────────────────── */
var _previewMode = 'edit';

function togglePreviewMode(mode) {
  _previewMode = mode;
  renderPreview();
}

function renderPreview() {
  var el = $id('tab-preview'); if(!el) return;
  var s = cur();
  if(!s) {
    el.innerHTML = '<div class="preview-empty"><p>Select a screen from the sidebar to preview it here.</p></div>';
    return;
  }

  var isEdit = _previewMode === 'edit';
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var journeyName = (S.journey&&S.journey.name) ? esc(S.journey.name) : 'Journey';

  var html = '<div class="pcf-inline-preview">';

  /* ── Mode toggle bar ── */
  html += '<div class="pcf-preview-modebar">' +
    '<span class="pcf-preview-modebar-title">&#x1F441;&#xFE0E; Preview — '+esc(s.name)+'</span>' +
    '<div class="pcf-preview-mode-toggle">' +
      '<button class="pcf-preview-mode-btn'+(!isEdit?' active':'')+'" onclick="togglePreviewMode(\'view\')">View</button>' +
      '<button class="pcf-preview-mode-btn'+(isEdit?' active':'')+'" onclick="togglePreviewMode(\'edit\')">Edit</button>' +
    '</div>' +
    '<span class="pcf-preview-modebar-hint">'+(isEdit?'Edit mode — inputs active':'View mode — read-only')+'</span>' +
  '</div>';

  /* ── GW PCF chrome ── */
  html += '<div class="pcf-inline-chrome">';

  html += '<div class="pcf-topnav">' +
    '<div class="pcf-topnav-logo"><div class="pcf-topnav-logo-icon">GW</div>PolicyCenter</div>' +
    '<div class="pcf-topnav-menus">' +
      '<span class="pcf-topnav-menu">Policies <span class="pcf-topnav-menu-arrow">&#9660;</span></span>' +
      '<span class="pcf-topnav-menu">Account <span class="pcf-topnav-menu-arrow">&#9660;</span></span>' +
      '<span class="pcf-topnav-menu">Billing <span class="pcf-topnav-menu-arrow">&#9660;</span></span>' +
      '<span class="pcf-topnav-menu">Admin <span class="pcf-topnav-menu-arrow">&#9660;</span></span>' +
    '</div>' +
    '<div class="pcf-topnav-right"><span class="pcf-topnav-user">&#128100; User</span></div>' +
  '</div>';

  html += '<div class="pcf-datebar">'+dateStr+'</div>';

  html += '<div class="pcf-title-row">' +
    '<h1>'+esc(s.name)+'</h1>' +
    '<a class="pcf-upto-link">&#8593; Up to '+esc(journeyName)+'</a>' +
  '</div>';

  if(isEdit) {
    html += '<div class="pcf-toolbar">' +
      '<button class="pcf-toolbar-btn primary">Save</button>' +
      '<button class="pcf-toolbar-btn" onclick="togglePreviewMode(\'view\')">Cancel</button>' +
      '<div class="pcf-toolbar-sep"></div>' +
      '<button class="pcf-toolbar-btn">Refresh</button>' +
    '</div>';
  } else {
    html += '<div class="pcf-toolbar">' +
      '<button class="pcf-toolbar-btn primary" onclick="togglePreviewMode(\'edit\')">Edit</button>' +
    '</div>';
  }

  html += '<div class="pcf-content pcf-inline-content">';

  if(!s.fields||!s.fields.length) {
    html += '<p style="color:#7a8e9c;font-family:Verdana,Arial,sans-serif;font-size:13px;padding:10px 0">No fields on this screen yet.</p>';
  } else {
    var lastSec = null;
    (s.fields||[]).forEach(function(f){
      var sec = f.section||s.name||'Details';
      if(sec !== lastSec) {
        if(lastSec !== null) html += '</div></div>'; /* close previous inputset+panel */
        html += '<div class="pcf-panel pcf-inline-panel"><div class="pcf-panel-header"><span class="pcf-panel-title">'+esc(sec)+'</span></div><div class="pcf-inputset">';
        lastSec = sec;
      }
      html += _renderPreviewField(f, isEdit);
    });
    if(lastSec !== null) html += '</div></div>'; /* close last inputset+panel */
  }

  if(s.cta||s.backLabel) {
    html += '<div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #e0e4ea">';
    if(s.cta)       html += '<button class="pcf-toolbar-btn primary">'+esc(s.cta)+'</button>';
    if(s.backLabel) html += '<button class="pcf-toolbar-btn">'+esc(s.backLabel)+'</button>';
    html += '</div>';
  }

  html += '</div>'; /* pcf-content */
  html += '</div>'; /* pcf-inline-chrome */
  html += '</div>'; /* pcf-inline-preview */

  el.innerHTML = html;
}

function _renderPreviewField(f, isEdit) {
  var ht  = _gwHtmlType(f);
  var req = f.required ? '<span class="pcf-req-star">*</span>' : '';
  var ro  = f.gwProps && f.gwProps.readOnly;
  var html = '<div class="pcf-field-row">';
  html += '<div class="pcf-label-cell">'+esc(f.label||'Field')+req+'</div>';
  html += '<div class="pcf-input-cell">';
  if(!isEdit || ro) {
    html += '<span class="pcf-view-value">'+(ro?'<em style="color:#9aacb8;font-size:11px">read-only</em>':'—')+'</span>';
  } else if(ht==='select') {
    html += '<select class="pcf-inp"><option>'+esc(f.placeholder||'Select…')+'</option></select>';
  } else if(ht==='textarea') {
    html += '<textarea class="pcf-inp" placeholder="'+esc(f.placeholder||'')+'"></textarea>';
  } else if(ht==='radio') {
    var tl=(f.gwProps&&f.gwProps.trueLabel)||'Yes';
    var fl=(f.gwProps&&f.gwProps.falseLabel)||'No';
    html += '<span class="pcf-radio-inline"><label><input type="radio" name="prev_'+f.id+'"> '+esc(tl)+'</label>&nbsp;&nbsp;<label><input type="radio" name="prev_'+f.id+'"> '+esc(fl)+'</label></span>';
  } else if(ht==='button') {
    html += '<button class="pcf-toolbar-btn primary">'+esc(f.label||'Button')+'</button>';
  } else if(ht==='label') {
    html += '<span style="font-size:13px;color:#2c3e50;font-family:Verdana,Arial,sans-serif">'+esc(f.label||'')+'</span>';
  } else if(ht==='alert') {
    html += '<div style="padding:5px 10px;background:#e8f2fb;border:1px solid #a8c8e8;border-radius:3px;font-size:12px;color:#1a4068">&#8505; '+esc(f.label||'')+'</div>';
  } else {
    html += '<input class="pcf-inp" type="'+ht+'" placeholder="'+esc(f.placeholder||'')+'">';
  }
  if(f.helpText) html += '<span class="pcf-field-help">'+esc(f.helpText)+'</span>';
  html += '</div></div>';
  return html;
}

function renderJSON() {
  var s = cur(); var out = $id('jsonOutput'); if(!out) return;
  if(!s){ out.textContent='// Select a screen to view JSON'; return; }
  out.textContent = JSON.stringify(s, null, 2);
}
function copyScreenJSON() {
  var s = cur(); if(!s){ toast('No screen selected'); return; }
  navigator.clipboard.writeText(JSON.stringify(s,null,2)).then(function(){ toast('Copied ✓'); }).catch(function(){ toast('Copy failed'); });
}

/* ═══════════════════════════════════════════════════
   JUTRO MAP (used by renderFields in app.js)
   ═══════════════════════════════════════════════════ */
var _JUTRO_MAP = {
  text:     { component:'TextInput',         pkg:'@jutro/components',    props:'' },
  email:    { component:'TextInput',         pkg:'@jutro/components',    props:'type="email"' },
  tel:      { component:'TextInput',         pkg:'@jutro/components',    props:'type="tel"' },
  number:   { component:'NumberField',       pkg:'@jutro/components',    props:'' },
  password: { component:'PasswordField',     pkg:'@jutro/components',    props:'' },
  date:     { component:'DatePickerSingle',  pkg:'@jutro/components',    props:'' },
  select:   { component:'Select',            pkg:'@jutro/components',    props:'' },
  textarea: { component:'TextArea',          pkg:'@jutro/components',    props:'' },
  checkbox: { component:'ToggleField',       pkg:'@jutro/components',    props:'' },
  radio:    { component:'RadioButtonField',  pkg:'@jutro/components',    props:'' },
  file:     { component:'FileUploadField',   pkg:'@jutro/components',    props:'' }
};

/* ═══════════════════════════════════════════════════
   STARTUP
   ═══════════════════════════════════════════════════ */
(function init() {
  /* Restore saved state */
  try {
    var raw = localStorage.getItem('aijs');
    if(raw) {
      var d = JSON.parse(raw);
      if(d.journey) S.journey = d.journey;
      if(d.screens) {
        S.screens = d.screens.map(function(s){
          if(!s.fields) s.fields=[];
          s.fields = s.fields.map(function(f){ if(!f.gwProps) f.gwProps={}; return f; });
          return s;
        });
      }
      if(d.cur) S.cur = d.cur;
    }
  } catch(e) { /* ignore */ }

  /* Restore settings — force Claude/OpenRouter as the only provider */
  var _savedModel = localStorage.getItem('aijs_model') || 'anthropic/claude-sonnet-5.5';
  localStorage.setItem('aijs_provider', 'openrouter');
  S.settings = {
    apiKey:     localStorage.getItem('aijs_apiKey')     || '',
    provider:   'openrouter',
    model:      _savedModel,
    maxScreens: localStorage.getItem('aijs_maxScreens') || '3'
  };

  if(S.journey) {
    _enableUI();
    renderList();
    if(S.cur) {
      var scr = S.screens.find(function(x){ return x.id===S.cur; });
      if(scr) showEditor(scr); else showWelcome();
    } else {
      showWelcome();
    }
    markSaved();
  } else {
    showWelcome();
  }
})();
