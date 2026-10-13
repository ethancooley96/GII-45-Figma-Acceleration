/* AI Journey Studio — app-jutro-preview.js
   Renders the full Jutro FloorPlan shell matching the GW Cloud Platform layout:
   Top bar | Tab bar | Left nav | Centre content | Right nav | Icon rail | Footer
*/

var _jutroPreviewMode = 'edit';

function togglePreviewMode(mode) {
  _jutroPreviewMode = mode;
  renderPreview();
}

function renderPreview() {
  var el = $id('tab-preview'); if(!el) return;
  var s = cur();
  if(!s) {
    el.innerHTML = '<div class="preview-empty"><p>Select a screen from the sidebar to preview it here.</p></div>';
    return;
  }

  var isEdit = _jutroPreviewMode === 'edit';
  var journeyName = (S.journey&&S.journey.name) ? esc(S.journey.name) : 'Journey';

  var html = '<div class="fp-shell">';

  /* ══════════════════════════════════════════
     TOP BAR
  ══════════════════════════════════════════ */
  html += '<div class="fp-topbar">' +
    /* Guidewire logo: geometric bracket-G mark + GUIDEWIRE text */
    '<div class="fp-topbar-brand">' +
      /* The Guidewire mark: square bracket G shape */
      '<svg width="28" height="22" viewBox="0 0 28 22" xmlns="http://www.w3.org/2000/svg" aria-label="Guidewire">' +
        /* Outer square bracket — top, left, bottom strokes */
        '<rect x="0" y="0" width="22" height="3" fill="#fff"/>' +   /* top */
        '<rect x="0" y="0" width="3" height="22" fill="#fff"/>' +   /* left */
        '<rect x="0" y="19" width="22" height="3" fill="#fff"/>' +  /* bottom */
        /* Right side open (no right stroke — makes it look like bracket) */
        /* Middle horizontal bar — the crossbar of the G */
        '<rect x="10" y="10" width="12" height="3" fill="#fff"/>' + /* mid bar */
        /* Right vertical stub at bottom of G — closes the bracket */
        '<rect x="19" y="10" width="3" height="12" fill="#fff"/>' + /* right lower */
      '</svg>' +
      '<span class="fp-brand-text">GUIDEWIRE</span>' +
    '</div>' +
    /* Search bar */
    '<div class="fp-search">' +
      '<input class="fp-search-input" type="text" placeholder="Search">' +
      '<span class="fp-search-icon">&#x1F50D;</span>' +
    '</div>' +
    /* Right icons */
    '<div class="fp-topbar-right">' +
      '<button class="fp-topbar-btn" title="Help">?</button>' +
      '<button class="fp-topbar-btn" title="Apps">&#x229E;</button>' +
      '<button class="fp-topbar-btn" title="Notifications">&#x1F514;</button>' +
      '<div class="fp-avatar">WW</div>' +
    '</div>' +
  '</div>';

  /* ══════════════════════════════════════════
     TAB BAR
  ══════════════════════════════════════════ */
  html += '<div class="fp-tabbar">' +
    '<div class="fp-tab fp-tab-active">'+esc(s.name)+'</div>' +
    '<div class="fp-tab fp-tab-drop">Overview &#9660;</div>' +
    '<div class="fp-tab">Details</div>' +
    '<div class="fp-tab">History</div>' +
    '<div class="fp-tab">Notes</div>' +
  '</div>';

  /* ══════════════════════════════════════════
     BODY (3 columns + icon rail)
  ══════════════════════════════════════════ */
  html += '<div class="fp-body">';

  /* ── Left nav ── */
  html += '<div class="fp-leftnav">';
  var navItems = ['Summary','Contacts','Documents','Activities','Claims','Renewals'];
  navItems.forEach(function(item, i){
    html += '<div class="fp-nav-item'+(i===1?' fp-nav-active':'')+'">' +
      '<span class="fp-nav-icon">&#x2197;</span>' +
      '<span class="fp-nav-label">'+item+'</span>' +
    '</div>';
  });
  html += '</div>';

  /* ── Centre content ── */
  html += '<div class="fp-centre">';

  /* Page title + view toggle */
  html += '<div class="fp-page-header">' +
    '<h1 class="fp-page-title">'+esc(s.name)+'</h1>' +
    '<div class="fp-view-toggle">' +
      '<button class="fp-view-btn'+(!isEdit?' fp-view-active':'')+'" onclick="togglePreviewMode(\'view\')">View</button>' +
      '<button class="fp-view-btn'+(isEdit?' fp-view-active':'')+'" onclick="togglePreviewMode(\'edit\')">Edit</button>' +
    '</div>' +
  '</div>';

  /* White content card */
  html += '<div class="fp-content-card">';

  if(!s.description && (!s.fields || !s.fields.length)) {
    html += '<p class="fp-empty">No fields yet — use AI Assist or the Fields tab to add fields to this screen.</p>';
  } else {
    if(s.description) {
      html += '<p class="fp-desc">'+esc(s.description)+'</p>';
    }

    /* Group fields by section */
    var panels = []; var panelMap = {};
    (s.fields||[]).forEach(function(f){
      var sec = f.section || s.name || 'Details';
      if(!panelMap[sec]){ panelMap[sec]=[]; panels.push(sec); }
      panelMap[sec].push(f);
    });

    panels.forEach(function(panelName){
      if(panels.length > 1) {
        html += '<h2 class="fp-section-title">'+esc(panelName)+'</h2>';
      }
      (panelMap[panelName]||[]).forEach(function(f){
        html += _renderFpField(f, isEdit);
      });
    });

    /* Action bar */
    if(s.cta || s.backLabel) {
      html += '<div class="fp-actions">';
      if(s.backLabel) html += '<button class="fp-btn-ghost">'+esc(s.backLabel)+'</button>';
      html += '<div class="fp-actions-right">';
      if(s.cta) {
        html += '<button class="fp-btn-outline">Reset</button>';
        html += '<button class="fp-btn-primary">'+esc(s.cta)+'</button>';
      }
      html += '</div></div>';
    }
  }

  html += '</div>'; /* content-card */
  html += '</div>'; /* centre */


  html += '</div>'; /* body */

  /* ══════════════════════════════════════════
     FOOTER
  ══════════════════════════════════════════ */
  html += '<div class="fp-footer">Footer</div>';

  html += '</div>'; /* shell */

  el.innerHTML = html;
}

function _renderFpField(f, isEdit) {
  var ht  = (typeof _gwHtmlType === 'function') ? _gwHtmlType(f) : (f.type || 'text');
  var ro  = f.gwProps && f.gwProps.readOnly;
  var html = '<div class="fp-field">';

  /* Label */
  if(f.gwWidget !== 'ButtonInput' && f.gwWidget !== 'Label' && f.gwWidget !== 'AlertBar') {
    var opt = (!f.required) ? ' <span class="fp-optional">(Optional)</span>' : '';
    html += '<label class="fp-label">'+esc(f.label||'Field')+opt+'</label>';
  }

  if(!isEdit || ro) {
    html += '<div class="fp-view-val">'+(ro?'<em style="color:#9ab">Read-only</em>':'—')+'</div>';
  } else if(ht === 'select') {
    var opts = '<option value="">'+esc(f.placeholder||'Select…')+'</option>';
    if(f.gwProps && f.gwProps.typeKey) {
      f.gwProps.typeKey.split(',').forEach(function(o){ opts += '<option>'+esc(o.trim())+'</option>'; });
    }
    html += '<select class="fp-input fp-select">'+opts+'</select>';
  } else if(ht === 'textarea') {
    html += '<textarea class="fp-input fp-textarea" rows="3" placeholder="'+esc(f.placeholder||'')+'"></textarea>';
  } else if(ht === 'radio') {
    var tl = (f.gwProps&&f.gwProps.trueLabel)  || 'Yes';
    var fl = (f.gwProps&&f.gwProps.falseLabel) || 'No';
    html += '<div class="fp-radios">' +
      '<label class="fp-radio"><input type="radio" name="fp_'+f.id+'"> '+esc(tl)+'</label>' +
      '<label class="fp-radio"><input type="radio" name="fp_'+f.id+'"> '+esc(fl)+'</label>' +
    '</div>';
  } else if(ht === 'button') {
    html += '<button class="fp-btn-outline fp-inline-btn">'+esc(f.label||'Action')+'</button>';
  } else if(ht === 'label') {
    html += '<p class="fp-static">'+esc(f.label||'')+'</p>';
  } else if(ht === 'alert') {
    html += '<div class="fp-info">'+esc(f.label||'')+'</div>';
  } else {
    html += '<input class="fp-input" type="'+ht+'" placeholder="'+esc(f.placeholder||'')+'">'; 
  }

  if(f.helpText) html += '<p class="fp-hint">'+esc(f.helpText)+'</p>';

  html += '</div>';
  return html;
}
