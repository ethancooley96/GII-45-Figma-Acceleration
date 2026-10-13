/* Alchemy Journey Studio — app-ai-patch.js
   Overrides aiGenerate() and resetJourney() from app-extra.js.
   Smart context-aware AI — no mode toggle needed.
   Load AFTER app-extra.js in index.html.
*/

/* ── resetJourney ───────────────────────────────── */
function resetJourney() {
  if(!confirm('Reset everything? This clears all unsaved work.')) return;
  S.journey=null; S.screens=[]; S.cur=null; S.dirty=false;
  localStorage.removeItem('aijs');
  var sn=$id('sidebarJourneyName'); if(sn) sn.innerHTML='<small>Current Journey</small>No journey loaded';
  var tt=$id('topbarTitle'); if(tt) tt.textContent='Alchemy Journey Studio';
  var ts=$id('topbarSub');   if(ts) ts.textContent='Create or import a journey to get started';
  ['addScreenBtn','topAddScreenBtn'].forEach(function(id){var e=$id(id);if(e)e.disabled=true;});
  renderList(); showWelcome(); markSaved(); toast('Reset ✓');
}

/* ─────────────────────────────────────────────────
   SMART AI GENERATE
   Automatically determines what to do based on context:
   • No screen selected  → generate journey screens
   • Screen selected     → add fields to that screen
   ───────────────────────────────────────────────── */
function aiGenerate() {
  var prompt = ($id('ai-prompt')||{value:''}).value.trim();
  if(!prompt){ toast('Enter a prompt first'); return; }

  var apiKey = (S.settings&&S.settings.apiKey) || localStorage.getItem('aijs_apiKey') || '';
  var model  = (S.settings&&S.settings.model)  || localStorage.getItem('aijs_model')  || 'anthropic/claude-sonnet-5.5';
  var maxScr = parseInt((S.settings&&S.settings.maxScreens)||localStorage.getItem('aijs_maxScreens')||'3');

  if(!apiKey){ toast('Add an API key in ⚙ Settings first'); openSettingsModal(); return; }

  /* ── Auto-create journey if none exists ── */
  if(!S.journey) {
    S.journey = { name:'My Journey', product:'', team:'', goal:'', createdAt:new Date().toISOString() };
    S.screens = []; S.cur = null;
    _enableUI(); showWelcome(); markDirty();
  }

  /* ── Determine mode from context ──────────────────
     If a screen is open AND the "Add to current screen" checkbox is checked → PCF mode
     Otherwise → journey mode (generate new screens)
  ─────────────────────────────────────────────────── */
  var currentScreen = cur();
  var addToScreenChecked = ($id('aiAddToScreen') && $id('aiAddToScreen').checked);
  var mode = (currentScreen && addToScreenChecked) ? 'pcf' : 'journey';

  /* Update hint text to reflect what will happen */
  var hint = $id('ai-hint-text');
  if(hint) {
    hint.textContent = (mode === 'pcf')
      ? '➕ Adding fields to "' + currentScreen.name + '"…'
      : '🗺️ Generating journey screens…';
  }

  var aiBtn = $id('aiBtn');
  if(aiBtn){ aiBtn.disabled=true; aiBtn.textContent='Generating…'; }
  _clearAiError();

  /* ── Build prompts ── */
  var systemPrompt, userPrompt, temperature, maxTokens;

  if(mode === 'pcf') {
    var s = currentScreen;
    temperature = 0.25;
    maxTokens   = 3500;
    systemPrompt = [
      'You are a Guidewire PolicyCenter PCF screen designer.',
      'Given a description, return a JSON array of widget objects.',
      'Each object MUST have: label (string), gwWidget (one of: Input, TextInput, TypeKeyInput, DateInput, CurrencyInput, IntegerInput, BooleanRadioInput, RangeInput, TextAreaInput, EmailInput, PhoneInput, PasswordInput, ButtonInput, ToolbarButton, DirectInvokeInput, Label, AlertBar), required (boolean), placeholder (string), helpText (string), section (string - panel/InputSet name), gwProps (object).',
      'gwProps rules: TypeKeyInput/RangeInput → include "typeKey" as comma-separated enum values. BooleanRadioInput → include "trueLabel" and "falseLabel". CurrencyInput/IntegerInput → include "min" and "max" numbers if relevant. ButtonInput/ToolbarButton/DirectInvokeInput → include "action" string. Otherwise use {}.',
      'Return ONLY the JSON array. No markdown, no explanation.'
    ].join('\n');
    userPrompt = 'Screen name: '+(s?s.name:'New Screen')+'\nDescription: '+prompt;

  } else {
    temperature = 0.3;
    maxTokens   = Math.min(8000, maxScr * 2000);
    var existingCtx = '';
    if(S.screens && S.screens.length) {
      existingCtx = '\nExisting screens (DO NOT duplicate): '+S.screens.map(function(sc){ return '"'+sc.name+'"'; }).join(', ')+'.';
    }
    systemPrompt = [
      'You are a UX journey designer for Guidewire PolicyCenter.',
      'Given a description, return a JSON array of up to '+maxScr+' screen objects.',
      'Each screen must have: name (string), type (form|confirmation|info|list|dashboard|error), step (number starting at '+(S.screens.length+1)+'), description (string), cta (string), backLabel (string), errorMessage (string), notes (string), fields (array), navigation ({onSuccess,onBack,onError,onSkip}).',
      'Each field must have: label, gwWidget, type, required (boolean), placeholder, helpText, section (panel name), gwProps (typeKey for TypeKeyInput/RangeInput; trueLabel+falseLabel for BooleanRadioInput; min+max for CurrencyInput/IntegerInput).',
      'Set navigation.onSuccess to the next screen name, onBack to the previous.',
      existingCtx,
      'Return ONLY the JSON array. No markdown, no explanation.'
    ].join('\n');
    userPrompt = prompt;
  }

  var endpoint   = 'https://openrouter.ai/api/v1/chat/completions';
  var reqHeaders = { 'Content-Type':'application/json', 'Authorization':'Bearer '+apiKey, 'HTTP-Referer':'https://alchemy-journey-studio', 'X-Title':'Alchemy Journey Studio' };
  var messages   = [{role:'system',content:systemPrompt},{role:'user',content:userPrompt}];

  /* ── Fetch helper ── */
  function doRequest(msgs) {
    var body = JSON.stringify({ model:model, messages:msgs, temperature:temperature, max_tokens:maxTokens });
    return fetch(endpoint, { method:'POST', headers:reqHeaders, body:body })
      .then(function(r){
        return r.text().then(function(txt){
          var data;
          try { data = JSON.parse(txt); } catch(e){ throw new Error('HTTP '+r.status+': '+txt.slice(0,300)); }
          if(!r.ok || data.error) throw new Error('HTTP '+r.status+' — '+(data.error?(data.error.message||JSON.stringify(data.error)):txt.slice(0,300)));
          return (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||'';
        });
      });
  }

  /* ── Apply response ── */
  function applyText(text) {
    text = text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();

    if(mode === 'pcf') {
      /* Extract JSON array */
      var match = text.match(/\[[\s\S]*\]/);
      if(!match) throw new Error('No JSON array in AI response');
      var parsed = JSON.parse(match[0]);
      var s = cur(); if(!s){ toast('No screen selected'); return; }
      if(!s.fields) s.fields = [];
      parsed.forEach(function(fw){
        var info = (typeof _gwWidgetInfo === 'function') ? _gwWidgetInfo(fw.gwWidget||'Input') : {htmlType:'text'};
        var gp = fw.gwProps || {};
        if(fw.typeKey)    gp.typeKey    = fw.typeKey;
        if(fw.trueLabel)  gp.trueLabel  = fw.trueLabel;
        if(fw.falseLabel) gp.falseLabel = fw.falseLabel;
        if(fw.min!=null)  gp.min        = fw.min;
        if(fw.max!=null)  gp.max        = fw.max;
        if(fw.action)     gp.action     = fw.action;
        s.fields.push({ id:uid(), label:fw.label||'', gwWidget:fw.gwWidget||'Input',
          type:info.htmlType||'text', required:!!fw.required, placeholder:fw.placeholder||'',
          helpText:fw.helpText||'', section:fw.section||(s.name||'Details'), gwProps:gp });
      });
      renderFields(); renderFieldsList();
      if(typeof _fieldsView !== 'undefined' && _fieldsView==='layout') renderFieldsScreenLayout();
      toast('Added '+parsed.length+' field'+(parsed.length!==1?'s':'')+' ✓');

    } else {
      /* Journey mode — extract JSON array of screens */
      var match2 = text.match(/\[[\s\S]*\]/);
      if(!match2) {
        var objM = text.match(/\{[\s\S]*\}/);
        if(objM) {
          try {
            var obj = JSON.parse(objM[0]);
            var ak = Object.keys(obj).find(function(k){ return Array.isArray(obj[k]); });
            if(ak) match2 = [JSON.stringify(obj[ak])];
          } catch(e2){}
        }
      }
      if(!match2) throw new Error('No JSON array in AI response');
      var screens = JSON.parse(match2[0]);
      screens.forEach(function(sd){
        var scr = { id:uid(), name:sd.name||'Screen', type:sd.type||'form',
          step:sd.step||(S.screens.length+1), description:sd.description||'',
          cta:sd.cta||'', backLabel:sd.backLabel||'', errorMessage:sd.errorMessage||'',
          notes:sd.notes||'',
          fields:(sd.fields||[]).map(function(f){
            var gp = f.gwProps || {};
            if(f.typeKey)    gp.typeKey    = f.typeKey;
            if(f.trueLabel)  gp.trueLabel  = f.trueLabel;
            if(f.falseLabel) gp.falseLabel = f.falseLabel;
            if(f.min!=null)  gp.min        = f.min;
            if(f.max!=null)  gp.max        = f.max;
            if(f.action)     gp.action     = f.action;
            return Object.assign({gwWidget:'Input'}, f, {id:uid(), gwProps:gp});
          }),
          navigation:sd.navigation||{onSuccess:'',onBack:'',onError:'',onSkip:''},
          accessibility:{pageTitle:sd.name||'Screen'} };
        S.screens.push(scr);
      });
      renderList();
      if(S.screens.length) openScr(S.screens[S.screens.length-1].id);
      toast('Generated '+screens.length+' screen'+(screens.length!==1?'s':'')+' ✓');
    }
    markDirty();
  }

  /* ── Main call with one retry on bad JSON ── */
  function resetHint() {
    var h = $id('ai-hint-text');
    if(h) h.textContent = cur()
      ? '💡 Select a screen to add fields, or describe a full journey to generate screens.'
      : '💡 Select a screen to add fields, or describe a full journey to generate screens.';
  }

  doRequest(messages)
    .then(function(text){
      try {
        applyText(text);
        resetHint();
      } catch(parseErr) {
        if(aiBtn) aiBtn.textContent = 'Retrying…';
        var retryMsgs = messages.concat([
          {role:'assistant', content:text},
          {role:'user', content:'Your response contained invalid or incomplete JSON. Return ONLY valid JSON with no extra text, explanation, or markdown.'}
        ]);
        doRequest(retryMsgs)
          .then(function(text2){
            try { applyText(text2); } catch(e2){ _showAiError('Invalid JSON after retry: '+e2.message); }
            resetHint();
          })
          .catch(function(err){ _showAiError(err.message); })
          .finally(function(){ if(aiBtn){ aiBtn.disabled=false; aiBtn.textContent='Generate with AI'; } });
        return;
      }
      if(aiBtn){ aiBtn.disabled=false; aiBtn.textContent='Generate with AI'; }
    })
    .catch(function(err){
      _showAiError(err.message);
      resetHint();
      if(aiBtn){ aiBtn.disabled=false; aiBtn.textContent='Generate with AI'; }
    });
}
