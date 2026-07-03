/* EvoStudio — i18n FR/EN/RU côté client, sans rechargement.
   ─────────────────────────────────────────────────────────────
   • Le FRANÇAIS est la source (texte déjà dans le HTML, mis en cache au 1er rendu).
     On ne fournit donc QUE les traductions EN + RU.
   • Inclure dans <head> :  <script src="/i18n.js" defer></script>
   • Balises HTML :
       data-i18n="clé"        → textContent
       data-i18n-html="clé"   → innerHTML (texte riche)
       data-i18n-ph="clé"     → placeholder
       data-i18n-title="clé"  → attribut title
       data-i18n-aria="clé"   → attribut aria-label
   • Chaque page peut définir, AVANT ce script :
       <script>window.I18N_PAGE = { en:{ "clé":"…" }, ru:{ "clé":"…" } };</script>
   • JS dynamique : window.t('clé', 'texte FR par défaut') + évènement window 'evo-langchange'.
   • Sélecteur de langue : rendu dans #lang-switch s'il existe (header),
     sinon injecté en flottant (haut-droite) — même logique que theme.js.
*/
(function () {
  var LANGS = ['fr', 'en', 'ru'];
  var FLAGS = { fr: '🇫🇷', ru: '🇷🇺', en: '🇬🇧' };
  var NAMES = { fr: 'Français', en: 'English', ru: 'Русский' };

  // ── Dico CORE : éléments partagés (nav, footer, commun). FR = source (non stocké). ──
  var CORE = {
    en: {
      'nav.products': 'Products', 'nav.smtp': 'SMTP', 'nav.proxy': 'Proxy',
      'nav.pricing': 'Pricing', 'nav.blog': 'Blog', 'nav.faq': 'FAQ',
      'nav.login': 'Log in', 'nav.account': 'Client area', 'nav.buy': 'Buy',
      'nav.home': 'Home', 'nav.about': 'About', 'nav.register': 'Sign up',
      'nav.smtp_full': 'SMTP server', 'nav.proxy_full': 'Residential proxy',
      'foot.tagline': 'Professional emailing suite and residential proxy.',
      'foot.brand': 'An <strong>EGSCI SARL</strong> brand ↗',
      'foot.h_product': 'Product', 'foot.tools': 'Our tools',
      'foot.smtp': 'SMTP server', 'foot.proxy': 'Residential proxy',
      'foot.pricing': 'Pricing', 'foot.buy': 'Buy',
      'foot.h_account': 'Account', 'foot.login': 'Log in', 'foot.register': 'Sign up',
      'foot.account': 'Client area', 'foot.privacy': 'Privacy',
      'foot.h_support': 'Support', 'foot.support_text': 'A question? Our team replies quickly.',
      'foot.resp': '⏱ Reply within 24h (business days)',
      'foot.copy': '© 2018–2026 EGSCI SARL · Russian Federation',
      'foot.privacy_policy': 'Privacy policy', 'foot.your_rights': 'Your rights',
      'foot.contact': 'Contact us',
      'common.details': 'Details →', 'common.buy': 'Buy', 'common.learn_more': 'Learn more'
    },
    ru: {
      'nav.products': 'Продукты', 'nav.smtp': 'SMTP', 'nav.proxy': 'Прокси',
      'nav.pricing': 'Тарифы', 'nav.blog': 'Блог', 'nav.faq': 'FAQ',
      'nav.login': 'Вход', 'nav.account': 'Личный кабинет', 'nav.buy': 'Купить',
      'nav.home': 'Главная', 'nav.about': 'О нас', 'nav.register': 'Регистрация',
      'nav.smtp_full': 'SMTP-сервер', 'nav.proxy_full': 'Резидентный прокси',
      'foot.tagline': 'Профессиональный набор для email-рассылок и резидентный прокси.',
      'foot.brand': 'Бренд <strong>EGSCI SARL</strong> ↗',
      'foot.h_product': 'Продукт', 'foot.tools': 'Наши инструменты',
      'foot.smtp': 'SMTP-сервер', 'foot.proxy': 'Резидентный прокси',
      'foot.pricing': 'Тарифы', 'foot.buy': 'Купить',
      'foot.h_account': 'Аккаунт', 'foot.login': 'Вход', 'foot.register': 'Регистрация',
      'foot.account': 'Личный кабинет', 'foot.privacy': 'Конфиденциальность',
      'foot.h_support': 'Поддержка', 'foot.support_text': 'Есть вопрос? Наша команда быстро ответит.',
      'foot.resp': '⏱ Ответ в течение 24 ч (в рабочие дни)',
      'foot.copy': '© 2018–2026 EGSCI SARL · Российская Федерация',
      'foot.privacy_policy': 'Политика конфиденциальности', 'foot.your_rights': 'Ваши права',
      'foot.contact': 'Связаться с нами',
      'common.details': 'Подробнее →', 'common.buy': 'Купить', 'common.learn_more': 'Узнать больше'
    }
  };

  function curLang() {
    try { var s = localStorage.getItem('evo-lang'); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) >= 0 ? n : 'fr';
  }
  var lang = curLang();
  document.documentElement.setAttribute('lang', lang);

  function dict(l) {
    var core = CORE[l] || {};
    var page = (window.I18N_PAGE && window.I18N_PAGE[l]) || {};
    var m = {}, k;
    for (k in core) m[k] = core[k];
    for (k in page) m[k] = page[k]; // la page peut surcharger le CORE
    return m;
  }

  // t() pour le JS : renvoie la trad ; en FR (ou si absente) renvoie le fallback FR fourni.
  window.t = function (key, frFallback) {
    if (lang === 'fr') return frFallback != null ? frFallback : key;
    var d = dict(lang);
    return (key in d) ? d[key] : (frFallback != null ? frFallback : key);
  };
  window.getLang = function () { return lang; };

  function tr(key) { var d = dict(lang); return (key in d) ? d[key] : null; }

  function translateEl(el) {
    if (el.hasAttribute('data-i18n')) {
      var k = el.getAttribute('data-i18n');
      if (el.__fr == null) el.__fr = el.textContent;
      var v = tr(k); el.textContent = (lang === 'fr') ? el.__fr : (v != null ? v : el.__fr);
    }
    if (el.hasAttribute('data-i18n-html')) {
      var kh = el.getAttribute('data-i18n-html');
      if (el.__frHtml == null) el.__frHtml = el.innerHTML;
      var vh = tr(kh); el.innerHTML = (lang === 'fr') ? el.__frHtml : (vh != null ? vh : el.__frHtml);
    }
    if (el.hasAttribute('data-i18n-ph')) {
      var kp = el.getAttribute('data-i18n-ph');
      if (el.__frPh == null) el.__frPh = el.getAttribute('placeholder') || '';
      var vp = tr(kp); el.setAttribute('placeholder', (lang === 'fr') ? el.__frPh : (vp != null ? vp : el.__frPh));
    }
    if (el.hasAttribute('data-i18n-title')) {
      var kt = el.getAttribute('data-i18n-title');
      if (el.__frTitle == null) el.__frTitle = el.getAttribute('title') || '';
      var vt = tr(kt); el.setAttribute('title', (lang === 'fr') ? el.__frTitle : (vt != null ? vt : el.__frTitle));
    }
    if (el.hasAttribute('data-i18n-aria')) {
      var ka = el.getAttribute('data-i18n-aria');
      if (el.__frAria == null) el.__frAria = el.getAttribute('aria-label') || '';
      var va = tr(ka); el.setAttribute('aria-label', (lang === 'fr') ? el.__frAria : (va != null ? va : el.__frAria));
    }
  }

  window.applyI18n = function (root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-title],[data-i18n-aria]');
    for (var i = 0; i < nodes.length; i++) translateEl(nodes[i]);
    document.documentElement.setAttribute('lang', lang);
  };

  window.setLang = function (l) {
    if (LANGS.indexOf(l) < 0) return;
    lang = l;
    try { localStorage.setItem('evo-lang', l); } catch (e) {}
    window.applyI18n(document);
    renderSwitch();
    try { window.dispatchEvent(new CustomEvent('evo-langchange', { detail: { lang: l } })); } catch (e) {}
  };

  // ── Style du sélecteur (auto-injecté → fonctionne sur toutes les pages) ──
  function injectStyle() {
    if (document.getElementById('evlang-style')) return;
    var css =
      '.lang-switch{position:relative;display:inline-block;font-family:"Inter",-apple-system,Segoe UI,sans-serif}' +
      '.lang-btn{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:10px;color:inherit;cursor:pointer;font-size:16px;line-height:1;font-weight:700;transition:.15s}' +
      '.lang-btn:hover{background:rgba(255,255,255,.13)}' +
      '.lang-btn .lang-code{font-size:12px;font-weight:800;letter-spacing:.02em}' +
      '.lang-btn svg{opacity:.6}' +
      'html[data-theme=light] .lang-btn{background:#fff;border-color:#e2e8f0;color:#0f172a}' +
      '.lang-menu{position:absolute;top:calc(100% + 6px);right:0;min-width:158px;background:#0f172a;border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.45);padding:6px}' +
      'html[data-theme=light] .lang-menu{background:#fff;border-color:#e6eaf1;box-shadow:0 16px 40px rgba(15,23,42,.18)}' +
      '.lang-item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 11px;background:none;border:none;border-radius:8px;color:#e2e8f0;font-size:13.5px;font-weight:600;text-align:left;cursor:pointer;font-family:inherit}' +
      '.lang-item:hover{background:rgba(255,255,255,.08)}' +
      '.lang-item.active{color:#3b82f6}' +
      'html[data-theme=light] .lang-item{color:#0f172a}' +
      'html[data-theme=light] .lang-item:hover{background:#f1f5f9}' +
      '#evlang-float{position:fixed;top:14px;right:14px;z-index:2147481000}';
    var st = document.createElement('style'); st.id = 'evlang-style'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function renderSwitch() {
    var host = document.getElementById('lang-switch');
    if (!host) {
      host = document.getElementById('evlang-float');
      if (!host) { host = document.createElement('div'); host.id = 'evlang-float'; document.body.appendChild(host); }
    }
    var items = LANGS.map(function (l) {
      return '<button type="button" class="lang-item' + (l === lang ? ' active' : '') + '" data-l="' + l + '">' + FLAGS[l] + ' ' + NAMES[l] + '</button>';
    }).join('');
    host.innerHTML =
      '<div class="lang-switch">' +
        '<button type="button" class="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="' + NAMES[lang] + '">' +
          FLAGS[lang] + '<span class="lang-code">' + lang.toUpperCase() + '</span>' +
          '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</button>' +
        '<div class="lang-menu" style="display:none">' + items + '</div>' +
      '</div>';
    var btn = host.querySelector('.lang-btn');
    var menu = host.querySelector('.lang-menu');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.style.display !== 'none';
      menu.style.display = open ? 'none' : 'block';
      btn.setAttribute('aria-expanded', String(!open));
    });
    host.querySelectorAll('.lang-item').forEach(function (it) {
      it.addEventListener('click', function (e) { e.stopPropagation(); window.setLang(it.getAttribute('data-l')); });
    });
  }
  // Ferme le menu au clic extérieur
  document.addEventListener('click', function () {
    var m = document.querySelector('#lang-switch .lang-menu, #evlang-float .lang-menu');
    if (m) m.style.display = 'none';
  });

  function init() { injectStyle(); window.applyI18n(document); renderSwitch(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
