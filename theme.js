/* EvoStudio — bascule thème clair/sombre, universelle.
   À inclure dans le <head> : <script src="/theme.js"></script>
   - Applique le thème mémorisé AVANT le rendu (pas de flash).
   - Injecte un bouton flottant lune/soleil si la page n'en a pas déjà un (#theme-toggle). */
(function () {
  try { if (localStorage.getItem('evo-theme') === 'light') document.documentElement.setAttribute('data-theme', 'light'); } catch (e) {}

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    if (document.getElementById('theme-toggle')) return; // la page gère déjà son bouton (ex. index)
    var b = document.createElement('button');
    b.id = 'theme-toggle';
    b.type = 'button';
    b.setAttribute('aria-label', 'Basculer clair / sombre');
    b.title = 'Mode clair / sombre';
    b.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(15,23,42,.72);color:#cbd5e1;backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .15s';
    b.innerHTML =
      '<svg class="tt-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      '<svg class="tt-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    function sync() {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      b.querySelector('.tt-moon').style.display = light ? 'none' : 'block';
      b.querySelector('.tt-sun').style.display = light ? 'block' : 'none';
      if (light) { b.style.background = 'rgba(255,255,255,.92)'; b.style.color = '#0f172a'; b.style.borderColor = '#e2e8f0'; }
      else { b.style.background = 'rgba(15,23,42,.72)'; b.style.color = '#cbd5e1'; b.style.borderColor = 'rgba(255,255,255,.14)'; }
    }
    b.addEventListener('mouseenter', function () { b.style.transform = 'scale(1.08)'; });
    b.addEventListener('mouseleave', function () { b.style.transform = 'scale(1)'; });
    b.addEventListener('click', function () {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      if (light) { document.documentElement.removeAttribute('data-theme'); try { localStorage.setItem('evo-theme', 'dark'); } catch (e) {} }
      else { document.documentElement.setAttribute('data-theme', 'light'); try { localStorage.setItem('evo-theme', 'light'); } catch (e) {} }
      sync();
    });
    document.body.appendChild(b);
    sync();
  });
})();
