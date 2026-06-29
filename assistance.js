/* Widget d'assistance flottant partagé — sur toutes les pages du site.
   - Connecté (evo_token présent) → chat bidirectionnel (/api/auth/support)
   - Visiteur sans compte       → formulaire de contact (/api/shop/contact) */
(function () {
  var API = 'https://admin.evostudio.fr';
  function token() { return localStorage.getItem('evo_token'); }
  function authHeaders() { var t = token(); return t ? { 'Authorization': 'Bearer ' + t } : {}; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var loggedIn = !!(token() || localStorage.getItem('evo_logged_in'));
  var open = false, started = false;
  var supportName = 'Support EvoStudio';
  var _lastUnread = 0, _lastAdmin = -1, _audioCtx = null;

  // Récupère le nom du support (configurable dans l'admin)
  if (loggedIn) {
    try { fetch(API + '/api/shop/products').then(function(r){return r.json();}).then(function(d){ if(d && d.support_name) supportName = d.support_name; }).catch(function(){}); } catch (e) {}
  }

  // Bip d'alerte (Web Audio — réveillé au 1er clic)
  function beep() {
    try {
      if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (_audioCtx.state === 'suspended') _audioCtx.resume();
      var o = _audioCtx.createOscillator(), g = _audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.value = 0.001; o.connect(g); g.connect(_audioCtx.destination);
      var t = _audioCtx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.start(t); o.stop(t + 0.34);
    } catch (e) {}
  }

  // ── DOM ──
  var win = document.createElement('div');
  win.id = 'ev-help-win';
  win.style.cssText = "display:none;position:fixed;right:20px;bottom:90px;z-index:99999;width:360px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #e6eaf1;border-radius:16px;box-shadow:0 18px 50px rgba(15,23,42,.28);overflow:hidden;font-family:'Inter',-apple-system,Segoe UI,sans-serif;flex-direction:column";
  var fab = document.createElement('button');
  fab.id = 'ev-help-fab';
  fab.setAttribute('aria-label', 'Assistance');
  fab.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:99999;width:58px;height:58px;border-radius:50%;background:#2563eb;color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(37,99,235,.45);font-size:26px';
  fab.innerHTML = '💬<span id="ev-help-badge" style="display:none;position:absolute;top:-3px;right:-3px;background:#dc2626;color:#fff;font-size:11px;font-weight:700;border-radius:999px;min-width:20px;height:20px;align-items:center;justify-content:center;padding:0 5px;border:2px solid #fff"></span>';

  var header = '<div style="background:#2563eb;color:#fff;padding:15px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">' +
    '<div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:16px">💬</div>' +
    '<div><div style="font-weight:700;font-size:14px">Assistance EvoStudio</div><div style="font-size:11px;opacity:.85">' + (loggedIn ? 'Nous répondons sous 24h' : 'Réponse par email sous 24h') + '</div></div></div>' +
    '<button id="ev-help-close" aria-label="Fermer" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;line-height:1;padding:0 4px">×</button></div>';

  if (loggedIn) {
    win.innerHTML = header +
      '<div id="ev-thread" style="flex:1;overflow-y:auto;max-height:360px;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc"></div>' +
      '<div style="border-top:1px solid #e6eaf1;padding:10px;display:flex;gap:8px;align-items:flex-end;flex-shrink:0">' +
        '<textarea id="ev-input" rows="1" placeholder="Écrivez votre message…" style="flex:1;resize:none;border:1px solid #e6eaf1;border-radius:10px;padding:10px 12px;font-size:13.5px;font-family:inherit;outline:none;max-height:120px"></textarea>' +
        '<button id="ev-send" aria-label="Envoyer" style="background:#2563eb;color:#fff;border:none;border-radius:10px;width:42px;height:42px;font-size:16px;cursor:pointer;flex-shrink:0">➤</button></div>';
  } else {
    win.innerHTML = header +
      '<div id="ev-cbody" style="padding:16px">' +
      '<p style="font-size:13px;color:#475569;margin:0 0 14px;line-height:1.5">Une question avant de créer votre compte ? Écrivez-nous, réponse par email.</p>' +
      '<label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Votre email</label>' +
      '<input id="ev-email" type="email" placeholder="vous@exemple.com" style="width:100%;border:1px solid #e6eaf1;border-radius:10px;padding:11px 13px;font-size:14px;outline:none;font-family:inherit;margin-bottom:12px" />' +
      '<label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Sujet</label>' +
      '<select id="ev-subject" style="width:100%;border:1px solid #e6eaf1;border-radius:10px;padding:11px 13px;font-size:14px;outline:none;font-family:inherit;margin-bottom:12px;background:#fff">' +
        '<option>Question générale</option><option>Avant-vente / Tarifs</option><option>Serveurs SMTP</option><option>Support technique</option><option>Autre</option></select>' +
      '<label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Message</label>' +
      '<textarea id="ev-msg" rows="4" placeholder="Votre message…" style="width:100%;border:1px solid #e6eaf1;border-radius:10px;padding:11px 13px;font-size:14px;outline:none;font-family:inherit;resize:vertical;margin-bottom:12px"></textarea>' +
      '<button id="ev-csend" style="width:100%;background:#2563eb;color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Envoyer</button>' +
      '<div id="ev-cstatus" style="font-size:13px;margin-top:10px;text-align:center;min-height:18px"></div></div>';
  }

  document.body.appendChild(win);
  document.body.appendChild(fab);

  function toggle() {
    // Débloque l'audio au 1er geste utilisateur (politique navigateur)
    try { if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (_audioCtx.state === 'suspended') _audioCtx.resume(); } catch (e) {}
    open = !open;
    win.style.display = open ? 'flex' : 'none';
    if (open) {
      if (loggedIn) { loadSupport(); setTimeout(function () { var i = document.getElementById('ev-input'); if (i) i.focus(); }, 80); }
      else { setTimeout(function () { var e = document.getElementById('ev-email'); if (e) e.focus(); }, 80); }
    } else if (loggedIn) { refreshUnread(); }
  }
  fab.addEventListener('click', toggle);
  document.getElementById('ev-help-close').addEventListener('click', toggle);

  // ── Mode connecté : chat ──
  async function loadSupport() {
    var thread = document.getElementById('ev-thread'); if (!thread) return;
    try {
      var r = await fetch(API + '/api/auth/support', { headers: authHeaders(), credentials: 'include' });
      if (!r.ok) return;
      var data = await r.json();
      var msgs = data.messages || [];
      var badge = document.getElementById('ev-help-badge'); if (badge) badge.style.display = 'none';
      var adminCount = msgs.filter(function (m) { return m.sender === 'admin'; }).length;
      var html = msgs.length ? msgs.map(function (m) {
        var when = new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        if (m.sender === 'system') return '<div style="text-align:center"><span style="display:inline-block;background:#eef2f7;color:#64748b;font-size:11px;padding:4px 12px;border-radius:999px">' + esc(m.body) + '</span></div>';
        var mine = m.sender === 'user';
        return '<div style="display:flex;justify-content:' + (mine ? 'flex-end' : 'flex-start') + '"><div style="max-width:78%;background:' + (mine ? '#2563eb' : '#f1f5f9') + ';color:' + (mine ? '#fff' : '#0f172a') + ';padding:9px 13px;font-size:13.5px;line-height:1.5;word-break:break-word;border-radius:12px">' + (mine ? '' : '<div style="font-size:10px;font-weight:700;color:#2563eb;margin-bottom:3px">' + esc(supportName) + '</div>') + esc(m.body).replace(/\n/g, '<br>') + '<div style="font-size:10px;opacity:.7;margin-top:4px;text-align:right">' + when + '</div></div></div>';
      }).join('') : '<div style="text-align:center;color:#94a3b8;font-size:13px;padding:20px">Aucun message. Posez votre question ci-dessous.</div>';
      if (data.closed) html += '<div style="text-align:center;margin-top:10px;padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:12px;border-radius:8px">✓ Conversation résolue. Écrivez un message pour la rouvrir.</div>';
      thread.innerHTML = html; thread.scrollTop = thread.scrollHeight;
      if (_lastAdmin >= 0 && adminCount > _lastAdmin) beep(); // nouvelle réponse admin
      _lastAdmin = adminCount;
    } catch (e) {}
  }
  async function refreshUnread() {
    if (!loggedIn || open) return;
    try {
      var r = await fetch(API + '/api/auth/support/unread', { headers: authHeaders(), credentials: 'include' });
      if (!r.ok) return;
      var d = await r.json();
      if (d.unread > _lastUnread) beep(); // nouveau message admin reçu
      _lastUnread = d.unread;
      var b = document.getElementById('ev-help-badge');
      if (b) { if (d.unread > 0) { b.textContent = d.unread; b.style.display = 'flex'; } else b.style.display = 'none'; }
    } catch (e) {}
  }
  async function sendSupport() {
    var inp = document.getElementById('ev-input'), btn = document.getElementById('ev-send');
    var body = inp.value.trim(); if (!body) return;
    btn.disabled = true;
    try {
      var r = await fetch(API + '/api/auth/support', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()), credentials: 'include', body: JSON.stringify({ body: body }) });
      var d = await r.json();
      if (r.ok && d.ok) { inp.value = ''; await loadSupport(); }
    } catch (e) {}
    btn.disabled = false;
  }

  // ── Mode visiteur : contact ──
  async function sendContact() {
    var email = document.getElementById('ev-email').value.trim();
    var subject = document.getElementById('ev-subject').value;
    var message = document.getElementById('ev-msg').value.trim();
    var st = document.getElementById('ev-cstatus'), btn = document.getElementById('ev-csend');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { st.style.color = '#dc2626'; st.textContent = 'Email invalide.'; return; }
    if (!message) { st.style.color = '#dc2626'; st.textContent = 'Écrivez un message.'; return; }
    btn.disabled = true; st.style.color = '#64748b'; st.textContent = 'Envoi…';
    try {
      var r = await fetch(API + '/api/shop/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, subject: subject, message: message }) });
      var d = await r.json();
      if (r.ok && d.ok) document.getElementById('ev-cbody').innerHTML = '<div style="text-align:center;padding:24px 8px"><div style="font-size:40px;margin-bottom:10px">✅</div><div style="font-weight:700;font-size:15px;color:#0f172a;margin-bottom:6px">Message envoyé !</div><div style="font-size:13px;color:#64748b;line-height:1.5">Merci, nous vous répondrons à <b>' + esc(email) + '</b> sous 24h.</div></div>';
      else { st.style.color = '#dc2626'; st.textContent = '❌ ' + (d.error || 'Erreur'); btn.disabled = false; }
    } catch (e) { st.style.color = '#dc2626'; st.textContent = '❌ Erreur réseau, réessayez.'; btn.disabled = false; }
  }

  if (loggedIn) {
    document.getElementById('ev-send').addEventListener('click', sendSupport);
    document.getElementById('ev-input').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSupport(); } });
    refreshUnread();
    setInterval(function () { if (open) loadSupport(); else refreshUnread(); }, 20000);
  } else {
    document.getElementById('ev-csend').addEventListener('click', sendContact);
  }
})();
