/* EvoStudio — Bannière de consentement cookies (RGPD / CNIL), universelle.
   Chargée sur toutes les pages via assistance.js.
   - 1re visite  : bannière « Tout accepter / Refuser / Personnaliser ».
   - Choix mémorisé dans localStorage (evo_cookie_consent) — PAS un cookie.
   - Réouverture : petit bouton flottant « 🍪 » + window.EvoCookies.open().
   - Catégories : Nécessaires (toujours actifs) + Mesure d'audience (optionnelle, OFF par défaut).
   - Gating : window.EvoCookies.accepted('analytics') + évènement 'evo-cookie-consent'. */
(function () {
  var KEY = 'evo_cookie_consent', VER = 1;
  if (window.EvoCookies) return; // évite le double-chargement

  function load() {
    try { var r = JSON.parse(localStorage.getItem(KEY)); if (r && r.v === VER) return r; } catch (e) {}
    return null;
  }
  function persist(analytics) {
    var rec = { v: VER, necessary: true, analytics: !!analytics, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) {}
    apply(rec);
    try { window.dispatchEvent(new CustomEvent('evo-cookie-consent', { detail: rec })); } catch (e) {}
    return rec;
  }
  function apply(rec) {
    // Point d'ancrage : (dés)activer les traceurs optionnels selon le consentement.
    // Actuellement le site n'embarque aucune mesure d'audience ; ce hook est prêt pour le futur.
    if (rec && rec.analytics) { /* ex : charger ici la mesure d'audience (1re partie) */ }
  }

  // ── Styles (indépendants d'evo-theme.css ; s'adaptent au thème via [data-theme=light]) ──
  var css = ''
    + '#evc-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(2,6,23,.55);display:none;opacity:0;transition:opacity .2s}'
    + '#evc-ov.show{display:block;opacity:1}'
    + '.evc-card{position:fixed;z-index:2147483001;font-family:"Inter",-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#e2e8f0;border:1px solid rgba(255,255,255,.10);box-shadow:0 20px 60px rgba(0,0,0,.45);border-radius:16px}'
    + 'html[data-theme=light] .evc-card{background:#fff;color:#0f172a;border-color:#e6eaf1;box-shadow:0 20px 60px rgba(15,23,42,.20)}'
    + '#evc-banner{left:50%;bottom:20px;transform:translateX(-50%);width:min(680px,calc(100vw - 32px));padding:20px 22px;display:none}'
    + '#evc-banner.show{display:block;animation:evcUp .35s ease}'
    + '@keyframes evcUp{from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}'
    + '.evc-t{font-weight:800;font-size:16px;margin:0 0 6px;display:flex;align-items:center;gap:8px}'
    + '.evc-p{font-size:13.5px;line-height:1.55;margin:0 0 16px;color:inherit;opacity:.82}'
    + '.evc-p a{color:#3b82f6;text-decoration:underline}'
    + '.evc-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}'
    + '.evc-btn{font-family:inherit;font-size:13.5px;font-weight:700;border-radius:10px;padding:11px 18px;cursor:pointer;border:1px solid transparent;transition:transform .12s,filter .12s,background .12s}'
    + '.evc-btn:hover{transform:translateY(-1px)}'
    + '.evc-primary{background:#2563eb;color:#fff}'
    + '.evc-primary:hover{filter:brightness(1.08)}'
    + '.evc-ghost{background:transparent;color:inherit;border-color:rgba(148,163,184,.45)}'
    + '.evc-ghost:hover{background:rgba(148,163,184,.14)}'
    + '#evc-modal{left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;padding:24px;display:none}'
    + '#evc-modal.show{display:block}'
    + '.evc-cat{border:1px solid rgba(148,163,184,.28);border-radius:12px;padding:14px 16px;margin:12px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:14px}'
    + '.evc-cat h4{margin:0 0 4px;font-size:14px;font-weight:700}'
    + '.evc-cat p{margin:0;font-size:12.5px;line-height:1.5;opacity:.75}'
    + '.evc-sw{position:relative;width:44px;height:26px;flex-shrink:0;margin-top:2px}'
    + '.evc-sw input{opacity:0;width:0;height:0;position:absolute}'
    + '.evc-sl{position:absolute;inset:0;background:#94a3b8;border-radius:999px;cursor:pointer;transition:background .2s}'
    + '.evc-sl:before{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s}'
    + '.evc-sw input:checked + .evc-sl{background:#2563eb}'
    + '.evc-sw input:checked + .evc-sl:before{transform:translateX(18px)}'
    + '.evc-sw input:disabled + .evc-sl{background:#22c55e;cursor:not-allowed}'
    + '#evc-pill{left:20px;bottom:76px;z-index:2147482000;display:none;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;font-family:"Inter",-apple-system,Segoe UI,sans-serif;font-size:12.5px;font-weight:600;cursor:pointer;background:rgba(15,23,42,.72);color:#cbd5e1;border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.30);transition:transform .15s}'
    + 'html[data-theme=light] #evc-pill{background:rgba(255,255,255,.92);color:#0f172a;border-color:#e2e8f0}'
    + '#evc-pill:hover{transform:scale(1.05)}'
    + '@media(max-width:520px){.evc-row{justify-content:stretch}.evc-btn{flex:1;text-align:center}}';
  var st = document.createElement('style'); st.id = 'evc-style'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  // ── DOM ──
  var ov = el('div', 'evc-ov');
  var banner = el('div', null, 'evc-card'); banner.id = 'evc-banner';
  banner.innerHTML =
    '<div class="evc-t">🍪 Respect de votre vie privée</div>' +
    '<p class="evc-p">Nous utilisons des cookies <b>strictement nécessaires</b> au fonctionnement du site et, <b>avec votre accord</b>, des cookies de mesure d\'audience pour l\'améliorer. Aucun cookie publicitaire, aucun traceur tiers. ' +
    '<a href="/privacy.html#s10">En savoir plus</a></p>' +
    '<div class="evc-row">' +
      '<button class="evc-btn evc-ghost" id="evc-refuse">Refuser</button>' +
      '<button class="evc-btn evc-ghost" id="evc-custom">Personnaliser</button>' +
      '<button class="evc-btn evc-primary" id="evc-accept">Tout accepter</button>' +
    '</div>';

  var modal = el('div', null, 'evc-card'); modal.id = 'evc-modal';
  modal.innerHTML =
    '<div class="evc-t">Préférences de cookies</div>' +
    '<p class="evc-p">Choisissez les catégories que vous autorisez. Votre choix est enregistré sur cet appareil et modifiable à tout moment.</p>' +
    '<div class="evc-cat">' +
      '<div><h4>Strictement nécessaires</h4><p>Indispensables : session, sécurité, préférences. Toujours actifs.</p></div>' +
      '<label class="evc-sw"><input type="checkbox" checked disabled><span class="evc-sl"></span></label>' +
    '</div>' +
    '<div class="evc-cat">' +
      '<div><h4>Mesure d\'audience</h4><p>Statistiques anonymes de fréquentation pour améliorer le site. Optionnel.</p></div>' +
      '<label class="evc-sw"><input type="checkbox" id="evc-analytics"><span class="evc-sl"></span></label>' +
    '</div>' +
    '<div class="evc-row" style="margin-top:18px">' +
      '<button class="evc-btn evc-ghost" id="evc-m-refuse">Tout refuser</button>' +
      '<button class="evc-btn evc-primary" id="evc-m-save">Enregistrer mes choix</button>' +
    '</div>';

  var pill = el('div', null, 'evc-card'); pill.id = 'evc-pill';
  pill.innerHTML = '<span>🍪</span><span>Cookies</span>';
  pill.setAttribute('role', 'button'); pill.setAttribute('aria-label', 'Gérer les cookies');

  function mount() {
    var b = document.body; if (!b) return;
    b.appendChild(ov); b.appendChild(banner); b.appendChild(modal); b.appendChild(pill);
    wire();
    if (load()) { apply(load()); showPill(); } else { showBanner(); }
  }

  function el(tag, id, cls) { var n = document.createElement(tag); if (id) n.id = id; if (cls) n.className = cls; return n; }
  function showBanner() { banner.classList.add('show'); }
  function hideBanner() { banner.classList.remove('show'); }
  function showModal() { var a = document.getElementById('evc-analytics'); var r = load(); if (a) a.checked = !!(r && r.analytics); ov.classList.add('show'); modal.classList.add('show'); }
  function hideModal() { ov.classList.remove('show'); modal.classList.remove('show'); }
  function showPill() { pill.style.display = 'inline-flex'; }
  function done(analytics) { persist(analytics); hideBanner(); hideModal(); showPill(); }

  function wire() {
    document.getElementById('evc-accept').addEventListener('click', function () { done(true); });
    document.getElementById('evc-refuse').addEventListener('click', function () { done(false); });
    document.getElementById('evc-custom').addEventListener('click', function () { hideBanner(); showModal(); });
    document.getElementById('evc-m-refuse').addEventListener('click', function () { done(false); });
    document.getElementById('evc-m-save').addEventListener('click', function () { var a = document.getElementById('evc-analytics'); done(a && a.checked); });
    ov.addEventListener('click', function () { hideModal(); if (!load()) showBanner(); });
    pill.addEventListener('click', showModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { hideModal(); if (!load()) showBanner(); } });
  }

  // API publique
  window.EvoCookies = {
    open: function () { hideBanner(); showModal(); },
    get: function () { return load(); },
    accepted: function (cat) { var r = load(); return !!(r && r[cat]); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
