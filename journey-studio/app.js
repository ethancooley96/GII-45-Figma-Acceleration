/* AI Journey Studio — app.js */
var S={journey:null,screens:[],cur:null,dirty:false};
function uid(){return 'scr-'+Math.random().toString(36).slice(2,9);}
function esc(s){return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>').replace(/"/g,'"');}
function $id(id){return document.getElementById(id);}
function setVal(id,v){var e=$id(id);if(e)e.value=v||'';}
function getVal(id){var e=$id(id);return e?e.value:'';}
function show(id,d){var e=$id(id);if(e)e.style.display=d;}
function toast(msg){var e=$id('toast');if(!e)return;e.textContent=msg;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show');},2400);}
function markDirty(){S.dirty=true;var p=$id('statusPill');if(p){p.className='status-pill';p.textContent='● Unsaved';}}
function markSaved(){S.dirty=false;var p=$id('statusPill');if(p){p.className='status-pill saved';p.textContent='✓ Saved';}}
function cur(){return S.screens.find(function(s){return s.id===S.cur;})||null;}
function openModal(id){var e=$id(id);if(e)e.style.display='block';}
function closeModal(id){var e=$id(id);if(e)e.style.display='none';}
document.addEventListener('click',function(e){if(e.target.classList.contains('modal-overlay'))e.target.style.display='none';});
function createJourney(){
  var n=getVal('nj-name').trim();if(!n){toast('Enter a journey name');return;}
  S.journey={name:n,product:getVal('nj-product').trim(),team:getVal('nj-team').trim(),goal:getVal('nj-goal').trim(),createdAt:new Date().toISOString()};
  S.screens=[];S.cur=null;closeModal('newJourneyModal');
  ['nj-name','nj-product','nj-team','nj-goal'].forEach(function(id){setVal(id,'');});
  _enableUI();showWelcome();markDirty();toast('Journey "'+n+'" created!');
}
function _enableUI(){
  var j=S.journey;if(!j)return;
  var sn=$id('sidebarJourneyName');if(sn)sn.innerHTML='<small>Current Journey</small>'+esc(j.name);
  var tt=$id('topbarTitle');if(tt)tt.textContent=j.name;
  var ts=$id('topbarSub');if(ts)ts.textContent=(j.product||'')+(j.team?' · '+j.team:'');
  ['addScreenBtn','topAddScreenBtn','aiBtn'].forEach(function(id){var e=$id(id);if(e)e.disabled=false;});
}
function saveJourney(){
  if(!S.journey){toast('No journey loaded');return;}
  try{localStorage.setItem('aijs',JSON.stringify({journey:S.journey,screens:S.screens,cur:S.cur}));markSaved();toast('Saved ✓');}
  catch(e){toast('Save failed');}
}
function addScreen(){
  if(!S.journey){toast('Create a journey first');return;}
  var n=getVal('ns-name').trim();if(!n){toast('Enter a screen name');return;}
  var step=parseInt(getVal('ns-step'))||S.screens.length+1;
  var scr={id:uid(),name:n,type:getVal('ns-type')||'form',step:step,description:getVal('ns-desc').trim(),cta:'',backLabel:'',errorMessage:'',notes:'',fields:[],navigation:{onSuccess:'',onBack:'',onError:'',onSkip:''},accessibility:{pageTitle:n}};
  S.screens.push(scr);closeModal('newScreenModal');
  ['ns-name','ns-step','ns-desc'].forEach(function(id){setVal(id,'');});
  renderList();openScr(scr.id);markDirty();toast('Screen added');
}
function deleteScreen(){if(!S.cur)return;if(!confirm('Delete this screen?'))return;S.screens=S.screens.filter(function(s){return s.id!==S.cur;});S.cur=null;renderList();showWelcome();markDirty();toast('Deleted');}
function deleteScreenById(id){if(!confirm('Delete?'))return;S.screens=S.screens.filter(function(s){return s.id!==id;});if(S.cur===id){S.cur=null;showWelcome();}renderList();markDirty();toast('Deleted');}
function duplicateScreen(){var s=cur();if(!s)return;var c=JSON.parse(JSON.stringify(s));c.id=uid();c.name=c.name+' (copy)';c.step=S.screens.length+1;S.screens.push(c);renderList();openScr(c.id);markDirty();toast('Duplicated');}
function openScr(id){S.cur=id;var s=cur();if(!s)return;renderList();showEditor(s);}
/* ─── Screen drag-to-reorder ─────────────────────── */
var _dragScrIdx = null;
function _scrDragStart(e, idx) {
  _dragScrIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}
function _scrDragEnd(e) { e.currentTarget.classList.remove('dragging'); }
function _scrDragOver(e, idx) {
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  var el = $id('screenList'); if(!el) return;
  el.querySelectorAll('.screen-item').forEach(function(n,i){
    n.classList.toggle('drag-over', i === idx && i !== _dragScrIdx);
  });
}
function _scrDrop(e, idx) {
  e.preventDefault();
  if(_dragScrIdx === null || _dragScrIdx === idx) { _dragScrIdx=null; renderList(); return; }
  var moved = S.screens.splice(_dragScrIdx, 1)[0];
  S.screens.splice(idx, 0, moved);
  /* Renumber steps to match new order */
  S.screens.forEach(function(s,i){ s.step = i+1; });
  _dragScrIdx = null;
  renderList();
  if(S.cur) { var s=cur(); if(s){ var et=$id('editorSub'); if(et) et.textContent='Step '+s.step+' · '+s.type; } }
  markDirty();
}
function renderList(){
  var el=$id('screenList');if(!el)return;
  if(!S.screens.length){el.innerHTML='<p style="color:#7fa0ae;font-size:.75rem;padding:6px 4px">No screens yet.</p>';return;}
  el.innerHTML=S.screens.map(function(s,i){
    var a=s.id===S.cur?' active':'';
    return '<div class="screen-item'+a+'" draggable="true"'+
      ' ondragstart="_scrDragStart(event,'+i+')"'+
      ' ondragend="_scrDragEnd(event)"'+
      ' ondragover="_scrDragOver(event,'+i+')"'+
      ' ondrop="_scrDrop(event,'+i+')"'+
      '><span class="drag-handle" title="Drag to reorder">⠿</span>'+
      '<button class="screen-name" onclick="openScr(\''+s.id+'\')">'+esc(s.name)+'<small>'+esc(s.type)+' · Step '+(s.step||'?')+'</small></button>'+
      '<button class="icon-btn danger" onclick="deleteScreenById(\''+s.id+'\')">✕</button></div>';
  }).join('');
}
function showWelcome(){
  show('welcomeView','flex');show('editorView','none');
  /* Hide the "add to screen" toggle when no screen is active */
  var tr=$id('aiScreenToggleRow'); if(tr) tr.style.display='none';
  var h=$id('ai-hint-text'); if(h) h.textContent='💡 Select a screen to add fields, or describe a full journey to generate screens.';
}
function showEditor(s){
  show('welcomeView','none');show('editorView','block');
  setVal('f-name',s.name);setVal('f-type',s.type);setVal('f-step',s.step);setVal('f-desc',s.description);setVal('f-cta',s.cta);setVal('f-back',s.backLabel);setVal('f-error',s.errorMessage);setVal('f-notes',s.notes);
  var nav=s.navigation||{};setVal('f-nav-success',nav.onSuccess);setVal('f-nav-back',nav.onBack);setVal('f-nav-error',nav.onError);setVal('f-nav-skip',nav.onSkip);
  setVal('f-aria-title',(s.accessibility||{}).pageTitle);
  var et=$id('editorTitle');if(et)et.textContent=s.name;
  var es=$id('editorSub');if(es)es.textContent='Step '+(s.step||'?')+' · '+s.type;
  /* Show the "add to screen" toggle and default to checked */
  var tr=$id('aiScreenToggleRow'); if(tr) tr.style.display='flex';
  var lbl=$id('aiScreenToggleLabel'); if(lbl) lbl.textContent='Add fields to "'+s.name+'"';
  var cb=$id('aiAddToScreen'); if(cb) cb.checked=true;
  var h=$id('ai-hint-text'); if(h) h.textContent='💡 Toggle off to generate new screens instead.';
  renderSummary(s);renderTags();renderFields();_updateTab();
}
function updateScreenField(f,v){var s=cur();if(!s)return;s[f]=v;if(f==='name'){var e=$id('editorTitle');if(e)e.textContent=v;renderList();}renderSummary(s);markDirty();}
function updateNavField(f,v){var s=cur();if(!s)return;if(!s.navigation)s.navigation={};s.navigation[f]=v;renderSummary(s);markDirty();}
function updateA11yField(f,v){var s=cur();if(!s)return;if(!s.accessibility)s.accessibility={};s.accessibility[f]=v;markDirty();}
function renderSummary(s){
  var el=$id('screenSummary');if(!el)return;
  var items=[];
  if(s.name)items.push('<strong>Name:</strong> '+esc(s.name));
  if(s.type)items.push('<strong>Type:</strong> '+esc(s.type));
  if(s.step)items.push('<strong>Step:</strong> '+s.step);
  if(s.cta)items.push('<strong>CTA:</strong> '+esc(s.cta));
  if(s.fields&&s.fields.length)items.push('<strong>Fields:</strong> '+s.fields.length);
  if((s.navigation||{}).onSuccess)items.push('<strong>→</strong> '+esc(s.navigation.onSuccess));
  el.innerHTML=items.length?items.map(function(i){return '<div class="small-item">'+i+'</div>';}).join(''):'<p class="sub">Fill in details to see a summary.</p>';
}
function renderTags(){
  var el=$id('journeySummaryTags');if(!el||!S.journey)return;
  var t=[];if(S.journey.product)t.push(esc(S.journey.product));if(S.journey.team)t.push(esc(S.journey.team));t.push(S.screens.length+' screen'+(S.screens.length!==1?'s':''));
  el.innerHTML=t.map(function(x){return '<span>'+x+'</span>';}).join('');
}
/* ─── Field drag-to-reorder ──────────────────────── */
var _dragFieldIdx = null;
function _fieldDragStart(e, idx) {
  _dragFieldIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}
function _fieldDragEnd(e) { e.currentTarget.classList.remove('dragging'); }
function _fieldDragOver(e, idx) {
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  var el = $id('fieldsList'); if(!el) return;
  el.querySelectorAll('.field-row').forEach(function(n,i){
    n.classList.toggle('drag-over', i === idx && i !== _dragFieldIdx);
  });
}
function _fieldDrop(e, idx) {
  e.preventDefault();
  var s = cur(); if(!s) return;
  if(_dragFieldIdx === null || _dragFieldIdx === idx) { _dragFieldIdx=null; renderFields(); return; }
  var moved = s.fields.splice(_dragFieldIdx, 1)[0];
  s.fields.splice(idx, 0, moved);
  _dragFieldIdx = null;
  renderFields(); renderSummary(s); markDirty();
}
function renderFields(){
  var el=$id('fieldsList');if(!el)return;var s=cur();
  if(!s||!s.fields||!s.fields.length){el.innerHTML='<p class="sub" style="padding:14px 0">No fields. Click + Add Field.</p>';return;}
  var types=['text','email','tel','number','password','date','select','textarea','checkbox','radio','file'];
  el.innerHTML=s.fields.map(function(f,i){
    var jmap = (typeof _JUTRO_MAP !== 'undefined' && _JUTRO_MAP[f.type]) || { component: 'TextInput', pkg: '@jutro/components', props: '' };
    var jProps = [jmap.props, f.required ? 'required' : ''].filter(Boolean).join(' ');
    var jBadge = '<div class="field-row-jutro">'+
      '<span class="jds-comp-name">'+jmap.component+'</span>'+
      (jProps ? ' <span class="jds-comp-props">'+esc(jProps)+'</span>' : '')+
      '<span class="jds-comp-pkg">'+jmap.pkg+'</span>'+
    '</div>';
    return '<div class="field-row" draggable="true"'+
      ' ondragstart="_fieldDragStart(event,'+i+')"'+
      ' ondragend="_fieldDragEnd(event)"'+
      ' ondragover="_fieldDragOver(event,'+i+')"'+
      ' ondrop="_fieldDrop(event,'+i+')"'+
      '><span class="drag" title="Drag to reorder" style="cursor:grab">⠿</span>'+
      '<input value="'+esc(f.label||'')+'" placeholder="Label" oninput="updateField('+i+',\'label\',this.value)">'+
      '<select onchange="updateField('+i+',\'type\',this.value)">'+types.map(function(t){return '<option value="'+t+'"'+(f.type===t?' selected':'')+'>'+t+'</option>';}).join('')+'</select>'+
      '<span class="req-input"><input type="checkbox"'+(f.required?' checked':'')+' onchange="updateField('+i+',\'required\',this.checked)"></span>'+
      '<button class="icon-btn danger" onclick="removeField('+i+')">✕</button>'+
      jBadge+
    '</div>';
  }).join('');
}
/* alias used by app-extra.js */
function renderFieldsList(){ renderFields(); }
function addField(){var s=cur();if(!s)return;if(!s.fields)s.fields=[];s.fields.push({label:'',id:uid(),type:'text',required:false,placeholder:'',helpText:'',section:''});renderFields();renderSummary(s);markDirty();}
function removeField(i){var s=cur();if(!s)return;s.fields.splice(i,1);renderFields();renderSummary(s);markDirty();}
function updateField(i,k,v){var s=cur();if(!s||!s.fields[i])return;s.fields[i][k]=v;renderSummary(s);markDirty();}
