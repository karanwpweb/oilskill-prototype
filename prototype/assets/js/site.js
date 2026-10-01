/* OilSkill prototype – front-end single-page app.
   Routes: #/{lang}/{page}/{id}?{query}. In production each route is a WordPress
   template (page, archive-{cpt}.php, single-{cpt}.php) and the language prefix is WPML's /pt/, /fr/. */
(function () {
  var t = I18N.t, L = I18N.L, D = DATA, TAX = D.TAX;
  var app = document.getElementById('app');
  var state = { lang: 'en', route: 'home', id: null, q: {} };

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function href(path, q) {
    var qs = q ? Object.keys(q).filter(function (k) { return q[k] !== '' && q[k] != null; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]); }).join('&') : '';
    return '#/' + state.lang + '/' + (path || '') + (qs ? '?' + qs : '');
  }
  function go(path, q) { location.hash = href(path, q).slice(1); }
  function tax(group, key) { return TAX[group] && TAX[group][key] ? L(TAX[group][key]) : (key || ''); }
  function fdate(iso) { return I18N.date(iso, state.lang); }
  function me() { var id = Store.get('session'); return id ? Store.user(id) : null; }
  function level() { var u = me(); return Store.accessLevel(u && u.id); }
  function toast(msg, err) {
    var w = document.querySelector('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    var el = document.createElement('div'); el.className = 'toast' + (err ? ' err' : ''); el.setAttribute('role', 'status'); el.textContent = msg; w.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }
  function flash(msg, kind) { Store.set('flash', { msg: msg, kind: kind || 'ok' }); }
  function takeFlash() { var f = Store.get('flash'); if (f) Store.set('flash', null); else return ''; return f ? '<div class="notice notice-' + f.kind + '" role="status">' + esc(f.msg) + '</div>' : ''; }
  function plan(id) { return D.PLANS.filter(function (p) { return p.id === id; })[0]; }
  function planName(id) { var p = plan(id); if (!p) return id; return L(p.name) + (p.cycle ? ' (' + t(p.cycle === 'month' ? 'mem.monthly' : 'mem.annual') + ')' : ''); }
  function sendMail(user, key, vars) { Store.mail(user.email, key, user.lang || state.lang, vars); }
  var ICON = {
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    cal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    lock: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m5 12 5 5 9-10"/></svg>',
    x: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    warn: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18v.5"/></svg>',
    chart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    plant: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21V11l5 3V11l5 3V7h4v14z"/><path d="M19 7V3"/></svg>',
    box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    hat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 7V4"/></svg>'
  };

  /* ---------- Illustrated image slots (replaced by licensed photos when supplied) ---------- */
  var ART_FOR = { hero: 'flng', mozlng: 'plant', rovuma: 'plant', pande: 'pipe', pemba: 'port', people: 'people' };
  var artN = 0;
  function art(kind) {
    var id = 'g' + (artN++);
    var sky = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D1336"/><stop offset=".55" stop-color="#5B2C55"/><stop offset=".85" stop-color="#E4572E"/><stop offset="1" stop-color="#F28936"/></linearGradient></defs>' +
      '<rect width="800" height="450" fill="url(#' + id + ')"/><circle cx="600" cy="300" r="70" fill="#FDC74D" opacity=".85"/>';
    var sea = '<rect y="315" width="800" height="135" fill="#140D27"/><path d="M0 330h800M0 352h800M0 380h800" stroke="#3B2F6B" stroke-width="2" opacity=".6"/>';
    var g = '';
    if (kind === 'flng') g = sea + '<g fill="#0E0920"><path d="M90 318h520l-28 26H118z"/><rect x="140" y="270" width="60" height="48"/><rect x="210" y="250" width="80" height="68"/><rect x="300" y="262" width="70" height="56"/><rect x="380" y="240" width="90" height="78"/><rect x="480" y="268" width="60" height="50"/><rect x="545" y="200" width="10" height="118"/><rect x="230" y="210" width="6" height="40"/><path d="M420 240l10-30 10 30z"/></g><path d="M550 200c-10-18 4-26 0-44 12 14 14 30 0 44z" fill="#FDC74D"/><g fill="#0E0920"><path d="M640 330h120l-12 12h-96z"/><circle cx="672" cy="322" r="11"/><circle cx="700" cy="322" r="11"/><circle cx="728" cy="322" r="11"/></g>';
    else if (kind === 'plant') g = '<rect y="320" width="800" height="130" fill="#140D27"/><g fill="#0E0920"><ellipse cx="160" cy="300" rx="70" ry="22"/><rect x="90" y="250" width="140" height="70"/><ellipse cx="160" cy="250" rx="70" ry="22" fill="#1D1336"/><ellipse cx="330" cy="300" rx="70" ry="22"/><rect x="260" y="250" width="140" height="70"/><ellipse cx="330" cy="250" rx="70" ry="22" fill="#1D1336"/><rect x="430" y="230" width="18" height="90"/><rect x="460" y="200" width="18" height="120"/><rect x="420" y="270" width="200" height="8"/><rect x="420" y="295" width="200" height="8"/><rect x="520" y="230" width="60" height="90"/><rect x="660" y="140" width="8" height="180"/></g><path d="M664 140c-10-16 4-24 0-40 12 12 14 28 0 40z" fill="#FDC74D"/>';
    else if (kind === 'pipe') g = '<rect y="330" width="800" height="120" fill="#2A1F4D"/><path d="M0 335 C200 320 600 345 800 330 V450 H0z" fill="#140D27"/><g fill="#0E0920"><rect x="0" y="292" width="800" height="18" rx="9"/><rect x="80" y="310" width="8" height="25"/><rect x="250" y="310" width="8" height="25"/><rect x="420" y="310" width="8" height="25"/><rect x="590" y="310" width="8" height="25"/><rect x="520" y="210" width="120" height="82"/><rect x="540" y="180" width="14" height="30"/><rect x="600" y="150" width="10" height="60"/></g><path d="M605 150c-9-14 4-22 0-36 11 11 13 25 0 36z" fill="#FDC74D"/>';
    else if (kind === 'port') g = sea + '<g fill="#0E0920"><rect x="60" y="300" width="380" height="20"/><path d="M120 300V150h10v150M120 160h120v8H120M230 168v40" stroke="#0E0920" stroke-width="8"/><path d="M300 300V170h10v130M300 180h110v8H300M400 188v30" stroke="#0E0920" stroke-width="8"/><rect x="80" y="270" width="50" height="30"/><rect x="135" y="270" width="50" height="30"/><rect x="190" y="276" width="50" height="24"/><rect x="108" y="244" width="50" height="26"/><path d="M480 318h260l-20 22H500z"/><rect x="540" y="280" width="40" height="38"/><rect x="590" y="290" width="110" height="28"/></g>';
    else g = '<rect y="330" width="800" height="120" fill="#140D27"/><g fill="#0E0920">' + [180, 320, 460, 600].map(function (x, i) { var h = i % 2 ? 0 : 12; return '<circle cx="' + x + '" cy="' + (215 + h) + '" r="30"/><path d="M' + (x - 38) + ' ' + (212 + h) + 'a38 30 0 0 1 76 0z" fill="#F28936"/><rect x="' + (x - 44) + '" y="' + (205 + h) + '" width="88" height="8" rx="4" fill="#F28936"/><path d="M' + (x - 60) + ' ' + (340) + 'c0-60 25-85 60-85s60 25 60 85z"/>'; }).join('') + '</g>';
    return '<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + sky + g + '</svg>';
  }
  window.__imgOk = function (el) {
    var tag = el.parentNode.querySelector('.ph-tag'); var k = el.getAttribute('data-k'); var im = D.IMAGES[k];
    if (tag && im) { tag.className = 'ph-tag badge b-illus'; tag.textContent = im.credit; }
  };
  function img(key, opts) {
    opts = opts || {};
    var im = D.IMAGES[key] || D.IMAGES.hero;
    return '<div class="ph" role="img" aria-label="' + esc(L(im.subject)) + ' · ' + esc(im.place) + '">' + art(ART_FOR[key] || 'flng') +
      '<img src="' + im.file + '" data-k="' + key + '" alt="' + esc(L(im.subject)) + '" loading="' + (opts.eager ? 'eager' : 'lazy') + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onload="__imgOk(this)" onerror="this.remove()">' +
      (opts.noTag ? '' : '<span class="ph-tag badge b-illus" title="' + esc(im.place) + '">' + t('badge.illustrative') + ' · ' + esc(im.place.split(',')[0]) + '</span>') + '</div>';
  }

  function badges(item, extra) {
    var b = [];
    if (item.premium) b.push('<span class="badge b-premium">★ ' + t('badge.premium') + '</span>');
    else if (extra !== 'nofree') b.push('<span class="badge b-free">' + t('badge.free') + '</span>');
    if (item.imported) b.push('<span class="badge b-imported">⟳ ' + t('badge.imported') + '</span>');
    if (item.sample) b.push('<span class="badge b-sample">' + t('badge.sample') + '</span>');
    if (state.lang !== 'en' && item.title && !I18N.hasLang(item.title, state.lang)) b.push('<span class="badge b-mt">' + t('badge.translationPending') + '</span>');
    else if (item.mt && state.lang !== 'en') b.push('<span class="badge b-mt">' + t('badge.mt') + '</span>');
    return '<div class="badges">' + b.join('') + '</div>';
  }
  function oppStatus(o) {
    if (!o.close) return 'open';
    var days = Math.ceil((new Date(o.close) - new Date()) / 864e5);
    return days < 0 ? 'closed' : days <= 7 ? 'soon' : 'open';
  }
  function statusBadge(o) {
    var s = oppStatus(o);
    return '<span class="badge ' + (s === 'closed' ? 'b-closed' : s === 'soon' ? 'b-soon' : 'b-open') + '">' + t(s === 'closed' ? 'd.closed' : s === 'soon' ? 'd.closingSoon' : 'd.openStatus') + '</span>';
  }
  function initials(n) { return n.split(/\s+/).filter(function (w) { return /^[A-Z]/.test(w); }).slice(0, 2).map(function (w) { return w[0]; }).join(''); }

  /* ---------------- layout ---------------- */
  var NAV = [['intel', 'nav.intelligence'], ['opps', 'nav.opportunities'], ['suppliers', 'nav.suppliers'], ['news', 'nav.news'], ['webinars', 'nav.webinars'], ['membership', 'nav.membership']];
  var NAV_MORE = [['about', 'nav.about'], ['contact', 'nav.contact']];
  function langSwitch() {
    var path = location.hash.replace(/^#\/(en|pt|fr)\/?/, '');
    return '<nav class="lang-switch" aria-label="' + t('nav.language') + '">' + I18N.langs.map(function (l) {
      return '<a href="#/' + l + '/' + path + '" hreflang="' + l + '" lang="' + l + '" class="' + (l === state.lang ? 'on' : '') + '" title="' + I18N.meta[l].label + '"' + (l === state.lang ? ' aria-current="true"' : '') + '>' + I18N.meta[l].short + '</a>';
    }).join('') + '</nav>';
  }
  function header() {
    var u = me();
    var ribbon = Store.get('ribbonClosed') ? '' : '<div class="ribbon"><div class="wrap"><span class="rb-text"><b>' + t('badge.sample') + ' / ' + t('badge.simulated') + '</b> · ' + t('demo.ribbon') + '</span><a href="' + href('guide') + '">' + t('demo.guide') + ' →</a><button data-act="close-ribbon" aria-label="' + t('demo.close') + '">×</button></div></div>';
    var suggest = '';
    var bl = (navigator.language || 'en').slice(0, 2);
    if (bl !== state.lang && (bl === 'pt' || bl === 'fr') && !Store.get('langSuggestClosed')) {
      suggest = '<div class="lang-suggest"><div class="wrap"><span>' + I18N.t('langSuggest', { lang: I18N.meta[bl].label }, bl) + '</span><a class="btn btn-dark btn-sm" href="#/' + bl + '/' + location.hash.replace(/^#\/(en|pt|fr)\/?/, '') + '">' + I18N.t('langSwitch', null, bl) + '</a><button class="icon-btn" style="margin-left:auto;width:30px;height:30px" data-act="close-suggest" aria-label="' + t('demo.close') + '">×</button></div></div>';
    }
    var nav = NAV.map(function (n) { return '<a href="' + href(n[0]) + '" class="' + (state.route === n[0] ? 'active' : '') + '">' + t(n[1]) + '</a>'; }).join('');
    var acct = u ? '<a class="btn btn-ghost btn-sm hide-m" href="' + href('account') + '">' + ICON.user + ' ' + esc(u.first) + '</a>'
      : '<a class="btn btn-ghost btn-sm hide-m" href="' + href('login') + '">' + t('nav.login') + '</a><a class="btn btn-primary btn-sm hide-m" href="' + href('register') + '">' + t('nav.join') + '</a>';
    return ribbon + suggest + '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + href('') + '" aria-label="OilSkill home"><img src="assets/img/logo-mark.png" alt="" width="30" height="46"><span class="bt"><b>OILSKILL</b><span>' + t('site.tagline') + '</span></span></a>' +
      '<nav class="mainnav" aria-label="Main">' + nav + '</nav>' +
      '<div class="hdr-actions"><a class="icon-btn hide-m" href="' + href('search') + '" aria-label="' + t('nav.search') + '">' + ICON.search + '</a>' + langSwitch() + acct +
      '<button class="icon-btn burger" data-act="menu" aria-label="' + t('nav.menu') + '" aria-expanded="false">' + ICON.menu + '</button></div></div></header>' +
      '<div class="mobile-nav" id="mnav" role="dialog" aria-label="' + t('nav.menu') + '"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-family:var(--font-display);font-size:1.3rem;letter-spacing:.1em">OILSKILL</b><button class="icon-btn" data-act="menu-close" aria-label="' + t('demo.close') + '">×</button></div>' +
      '<div class="lang-switch">' + langSwitch().replace(/^<nav[^>]*>|<\/nav>$/g, '') + '</div>' +
      '<a href="' + href('') + '">' + t('nav.home') + '</a>' + nav.replace(/ class="[^"]*"/g, '') + NAV_MORE.map(function (n) { return '<a href="' + href(n[0]) + '">' + t(n[1]) + '</a>'; }).join('') + '<a href="' + href('search') + '">' + t('nav.search') + '</a>' +
      (u ? '<a href="' + href('account') + '">' + t('nav.account') + '</a><a href="#" data-act="logout">' + t('nav.logout') + '</a>' : '<a href="' + href('login') + '">' + t('nav.login') + '</a><a href="' + href('register') + '" style="color:var(--orange-d);font-weight:700">' + t('nav.join') + '</a>') +
      '</div>';
  }
  function footer() {
    return '<footer class="site-footer"><div class="wrap"><div class="foot-grid">' +
      '<div><div class="foot-brand"><span class="logo-tile"><img src="assets/img/logo-mark.png" alt="" width="29" height="44"></span><b>OILSKILL</b></div><p>' + t('footer.about') + '</p><p class="small" style="color:var(--gold)">' + t('site.tagline') + '</p>' + langSwitch() + '</div>' +
      '<div><h4>' + t('footer.platform') + '</h4><ul><li><a href="' + href('intel') + '">' + t('nav.intelligence') + '</a></li><li><a href="' + href('opps') + '">' + t('nav.opportunities') + '</a></li><li><a href="' + href('suppliers') + '">' + t('nav.suppliers') + '</a></li><li><a href="' + href('news') + '">' + t('nav.news') + '</a></li><li><a href="' + href('webinars') + '">' + t('nav.webinars') + '</a></li></ul></div>' +
      '<div><h4>' + t('footer.company') + '</h4><ul><li><a href="' + href('about') + '">' + t('nav.about') + '</a></li><li><a href="' + href('membership') + '">' + t('nav.membership') + '</a></li><li><a href="' + href('contact') + '">' + t('nav.contact') + '</a></li><li><a href="' + href('guide') + '">' + t('demo.guide') + '</a></li><li><a href="admin.html">' + t('nav.admin') + '</a></li></ul></div>' +
      '<div><h4>' + t('footer.legal') + '</h4><ul><li><a href="' + href('privacy') + '">' + t('privacy.title') + '</a></li><li><a href="' + href('terms') + '">' + t('terms.title') + '</a></li><li><a href="' + href('credits') + '">' + t('credits.title') + '</a></li></ul><p class="small" style="margin-top:14px">Maputo, Mozambique<br>info@oilskill-demo.test</p></div>' +
      '</div><div class="foot-bottom"><span>' + t('footer.rights') + '</span><span>' + t('badge.mt') + ' (PT/FR)</span></div></div></footer>' +
      (Store.get('cookie') ? '' : '<div class="cookie" role="dialog" aria-label="Cookies"><b>Cookies</b><p style="margin:6px 0 0">' + t('cookie.text') + ' <a href="' + href('privacy') + '">' + t('privacy.title') + '</a></p><div class="acts"><button class="btn btn-dark btn-sm" data-act="cookie" data-v="all">' + t('cookie.accept') + '</button><button class="btn btn-ghost btn-sm" data-act="cookie" data-v="essential">' + t('cookie.reject') + '</button></div></div>');
  }
  function pageHead(titleKey, introKey, crumbs, extra) {
    return '<section class="page-head"><div class="wrap"><div class="crumbs"><a href="' + href('') + '">' + t('nav.home') + '</a>' + (crumbs || []).map(function (c) { return ' / ' + (c[1] ? '<a href="' + href(c[1]) + '">' + esc(c[0]) + '</a>' : esc(c[0])); }).join('') + '</div>' +
      '<h1>' + (titleKey.indexOf('.') > 0 ? t(titleKey) : esc(titleKey)) + '</h1>' + (introKey ? '<p>' + t(introKey) + '</p>' : '') + (extra || '') + '</div></section>';
  }

  /* ---------------- cards ---------------- */
  function intelCard(x) {
    return '<article class="card"><div class="card-media">' + img(x.img || 'hero', { noTag: true }) + '</div><div class="card-body">' + badges(x) +
      '<h3><a href="' + href('intel/' + x.id) + '">' + esc(L(x.title)) + '</a></h3><p>' + esc(L(x.summary)) + '</p>' +
      '<div class="card-meta"><span>' + ICON.cal + fdate(x.date) + '</span><span>' + tax('sector', x.sector) + '</span><span>' + tax('intelCat', x.cat) + '</span></div></div></article>';
  }
  function oppCard(x) {
    var days = x.close ? Math.ceil((new Date(x.close) - new Date()) / 864e5) : null;
    return '<article class="card row-card opp-card"><div class="card-body"><div class="badges">' + statusBadge(x) + '<span class="badge b-sector">' + tax('oppType', x.type) + '</span>' + badges(x).replace(/^<div class="badges">|<\/div>$/g, '') + '</div>' +
      '<h3><a href="' + href('opps/' + x.id) + '">' + esc(L(x.title)) + '</a></h3><p>' + esc(x.org || '') + '</p>' +
      '<div class="card-meta"><span>' + ICON.pin + tax('location', x.loc) + '</span><span>' + tax('sector', x.sector) + '</span><span>' + t('d.published') + ': ' + fdate(x.date) + '</span></div></div>' +
      '<div class="deadline"><span class="small muted">' + t('d.closing') + '</span><b>' + (x.close ? I18N.date(x.close, state.lang, { day: 'numeric', month: 'short', year: 'numeric' }) : '–') + '</b>' + (days != null && days >= 0 ? '<span class="small" style="color:var(--orange-d)">' + t('d.daysLeft', { n: days }) + '</span>' : '') + '</div></article>';
  }
  function supCard(x) {
    return '<article class="card"><div class="card-body"><div class="sup-head"><div class="sup-logo" style="background:' + x.color + '" aria-hidden="true">' + initials(x.name) + '</div><div><h3><a href="' + href('suppliers/' + x.id) + '">' + esc(x.name) + '</a></h3><span class="small muted">' + ICON.pin + ' ' + esc(x.city) + ', ' + tax('location', x.loc) + '</span></div></div>' +
      '<p>' + esc(L(x.overview)) + '</p><div class="badges">' + x.services.map(function (s) { return '<span class="badge b-sector">' + tax('service', s) + '</span>'; }).join('') + (x.sample ? '<span class="badge b-sample">' + t('badge.sample') + '</span>' : '') + '</div>' +
      '<div class="card-foot"><span class="small muted">' + x.certs.join(' · ') + '</span><a class="btn btn-ghost btn-sm" href="' + href('suppliers/' + x.id) + '">' + t('list.viewProfile') + '</a></div></div></article>';
  }
  function newsCard(x) {
    return '<article class="card"><div class="card-media">' + img(x.img || 'pemba', { noTag: true }) + '</div><div class="card-body">' + badges(x, 'nofree') +
      '<h3><a href="' + href('news/' + x.id) + '">' + esc(L(x.title)) + '</a></h3><p>' + esc(L(x.summary)) + '</p><div class="card-meta"><span>' + ICON.cal + fdate(x.date) + '</span><span>' + tax('newsCat', x.cat) + '</span>' + (x.source ? '<span>' + t('d.source') + ': ' + esc(x.source.name) + '</span>' : '') + '</div></div></article>';
  }
  function webCard(x) {
    var past = new Date(x.start) < new Date();
    return '<article class="card"><div class="card-media">' + img(x.img || 'people', { noTag: true }) + '<span class="badge ' + (past ? 'b-closed' : 'b-open') + '">' + t(past ? 'list.past' : 'list.upcoming') + '</span></div><div class="card-body">' + badges(x) +
      '<h3><a href="' + href('webinars/' + x.id) + '">' + esc(L(x.title)) + '</a></h3><p>' + esc(L(x.summary)) + '</p>' +
      '<div class="card-meta"><span>' + ICON.cal + I18N.dateTime(x.start, state.lang) + ' CAT</span><span>' + esc(x.speakers.map(function (s) { return s.name; }).join(', ')) + '</span></div></div></article>';
  }

  /* ---------------- generic listing with filters ---------------- */
  var LISTS = {
    intel: { type: 'intel', title: 'intel.title', intro: 'intel.intro', card: intelCard, grid: 'g3', crumb: 'nav.intelligence',
      filters: [['cat', 'list.category', 'intelCat'], ['sector', 'list.sector', 'sector'], ['date', 'list.date', 'date'], ['access', 'list.access', 'access']], sorts: ['newest', 'az'] },
    opps: { type: 'opp', title: 'opps.title', intro: 'opps.intro', card: oppCard, grid: '', crumb: 'nav.opportunities',
      filters: [['type', 'list.type', 'oppType'], ['sector', 'list.sector', 'sector'], ['loc', 'list.location', 'location'], ['status', 'list.status', 'status'], ['date', 'list.date', 'date']], sorts: ['deadline', 'newest', 'az'] },
    suppliers: { type: 'supplier', title: 'sup.title', intro: 'sup.intro', card: supCard, grid: 'g2', crumb: 'nav.suppliers',
      filters: [['service', 'list.service', 'service'], ['sector', 'list.sector', 'sector'], ['loc', 'list.location', 'location']], sorts: ['az'] },
    news: { type: 'news', title: 'news.title', intro: 'news.intro', card: newsCard, grid: 'g3', crumb: 'nav.news',
      filters: [['cat', 'list.category', 'newsCat'], ['date', 'list.date', 'date']], sorts: ['newest', 'az'] },
    webinars: { type: 'webinar', title: 'web.title', intro: 'web.intro', card: webCard, grid: 'g3', crumb: 'nav.webinars', tabs: true,
      filters: [['cat', 'list.category', 'webCat'], ['date', 'list.date', 'date']], sorts: ['newest', 'az'] }
  };
  function textOf(x) { return [L(x.title), x.title && x.title.en, L(x.summary), L(x.desc), L(x.overview), x.org, x.name, x.city, (x.services || []).map(function (s) { return tax('service', s); }).join(' ')].join(' ').toLowerCase(); }
  function applyFilters(cfg, items, q) {
    var now = new Date();
    return items.filter(function (x) {
      if (q.q && textOf(x).indexOf(q.q.toLowerCase()) < 0) return false;
      if (q.cat && x.cat !== q.cat) return false;
      if (q.type && x.type !== q.type) return false;
      if (q.sector && x.sector !== q.sector) return false;
      if (q.loc && x.loc !== q.loc) return false;
      if (q.service && (x.services || []).indexOf(q.service) < 0) return false;
      if (q.status && oppStatus(x) !== q.status) return false;
      if (q.access && ((q.access === 'premium') !== !!x.premium)) return false;
      if (q.date) { var dd = new Date(x.date || x.start); if ((now - dd) / 864e5 > +q.date || dd > now) return false; }
      if (cfg.tabs) { var past = new Date(x.start) < now; if ((q.tab || 'upcoming') === 'upcoming' ? past : !past) return false; }
      return true;
    });
  }
  function sortItems(items, s) {
    var a = items.slice();
    if (s === 'az') a.sort(function (x, y) { return (L(x.title) || x.name).localeCompare(L(y.title) || y.name); });
    else if (s === 'deadline') a.sort(function (x, y) { var sx = oppStatus(x) === 'closed', sy = oppStatus(y) === 'closed'; if (sx !== sy) return sx ? 1 : -1; return new Date(x.close || 8e15) - new Date(y.close || 8e15); });
    else a.sort(function (x, y) { return new Date(y.date || y.start) - new Date(x.date || x.start); });
    return a;
  }
  function options(kind) {
    if (kind === 'date') return [['30', t('list.date.30')], ['90', t('list.date.90')], ['365', t('list.date.365')]];
    if (kind === 'status') return [['open', t('d.openStatus')], ['soon', t('d.closingSoon')], ['closed', t('d.closed')]];
    if (kind === 'access') return [['free', t('badge.free')], ['premium', t('badge.premium')]];
    return Object.keys(TAX[kind]).map(function (k) { return [k, L(TAX[kind][k])]; });
  }
  function listView(name) {
    var cfg = LISTS[name], q = state.q, per = cfg.type === 'opp' ? 6 : 6;
    var items = sortItems(applyFilters(cfg, Repo.all(cfg.type), q), q.sort || cfg.sorts[0]);
    var pages = Math.max(1, Math.ceil(items.length / per)), pg = Math.min(pages, Math.max(1, +q.page || 1));
    var shown = items.slice((pg - 1) * per, pg * per);
    var f = '<form class="filters" id="filters" role="search"><h3>' + t('list.filters') + ' <a href="' + href(name, cfg.tabs ? { tab: q.tab } : null) + '" class="small" style="font-family:var(--font-body);font-weight:500">' + t('list.clear') + '</a></h3>' +
      '<div class="field"><label for="f-q">' + t('list.keyword') + '</label><input type="search" id="f-q" name="q" value="' + esc(q.q || '') + '" placeholder="' + t('list.keyword.ph') + '"></div>' +
      cfg.filters.map(function (fl) {
        var opts = options(fl[2]);
        return '<div class="field"><label for="f-' + fl[0] + '">' + t(fl[1]) + '</label><select id="f-' + fl[0] + '" name="' + fl[0] + '"><option value="">' + t(fl[2] === 'date' ? 'list.date.any' : 'list.any') + '</option>' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (q[fl[0]] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
      }).join('') + (cfg.tabs ? '<input type="hidden" name="tab" value="' + esc(q.tab || 'upcoming') + '">' : '') +
      '<button class="btn btn-dark btn-block" type="submit">' + t('list.apply') + '</button></form>';
    var chips = Object.keys(q).filter(function (k) { return q[k] && ['page', 'sort', 'tab'].indexOf(k) < 0; }).map(function (k) {
      var fl = cfg.filters.filter(function (x) { return x[0] === k; })[0];
      var label = k === 'q' ? '“' + q.q + '”' : (options(fl ? fl[2] : 'date').filter(function (o) { return o[0] === q[k]; })[0] || [0, q[k]])[1];
      return '<span class="chip">' + esc(label) + '<button data-act="unfilter" data-k="' + k + '" aria-label="' + t('list.clear') + '">×</button></span>';
    }).join('');
    var tabs = cfg.tabs ? '<div class="tabs" role="tablist"><a role="tab" href="' + href(name, Object.assign({}, q, { tab: 'upcoming', page: '' })) + '" class="' + ((q.tab || 'upcoming') === 'upcoming' ? 'on' : '') + '">' + t('list.upcoming') + '</a><a role="tab" href="' + href(name, Object.assign({}, q, { tab: 'past', page: '' })) + '" class="' + (q.tab === 'past' ? 'on' : '') + '">' + t('list.past') + '</a></div>' : '';
    var top = '<div class="list-top"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn btn-ghost btn-sm filter-toggle" data-act="toggle-filters">' + ICON.search + ' ' + t('list.filters') + '</button>' + tabs + '<b aria-live="polite">' + (items.length === 1 ? t('list.result1') : t('list.results', { n: items.length })) + '</b></div>' +
      '<label class="small muted" style="display:flex;gap:8px;align-items:center">' + t('list.sort') + '<select data-act="sort">' + cfg.sorts.map(function (s) { return '<option value="' + s + '"' + ((q.sort || cfg.sorts[0]) === s ? ' selected' : '') + '>' + t('list.sort.' + s) + '</option>'; }).join('') + '</select></label></div>';
    var body = shown.length ? '<div class="grid ' + cfg.grid + '">' + shown.map(cfg.card).join('') + '</div>' : '<div class="empty">' + t('list.none') + '</div>';
    var pager = pages > 1 ? '<nav class="pager" aria-label="Pagination">' + (pg > 1 ? '<a class="btn btn-ghost btn-sm" href="' + href(name, Object.assign({}, q, { page: pg - 1 })) + '">← ' + t('list.prev') + '</a>' : '') + '<span class="small muted">' + t('list.page', { a: pg, b: pages }) + '</span>' + (pg < pages ? '<a class="btn btn-ghost btn-sm" href="' + href(name, Object.assign({}, q, { page: pg + 1 })) + '">' + t('list.next') + ' →</a>' : '') + '</nav>' : '';
    return pageHead(cfg.title, cfg.intro, [[t(cfg.crumb)]]) + '<section class="section" style="padding-top:32px"><div class="wrap list-layout">' + f + '<div>' + top + (chips ? '<div class="chips">' + chips + '</div>' : '') + body + pager + '</div></div></section>';
  }

  /* ---------------- detail views ---------------- */
  function sourceBox(x) {
    if (!x.source) return '';
    return '<div class="source-box"><b>' + t('d.source') + ':</b> ' + esc(x.source.name) + ' · <a href="' + esc(x.source.url) + '" target="_blank" rel="noopener nofollow">' + t('d.sourceOriginal') + ' ↗</a><br><span class="muted">' + t('d.importedOn', { d: fdate(x.source.importedAt) }) + (x.updatedAtSource ? ' · ' + t('d.updated') + ' ' + fdate(x.updatedAtSource) : '') + '</span></div>';
  }
  function gate(teaserHtml) {
    var lv = level(), u = me(), s = u && Store.subFor(u.id);
    var txt = lv === 'visitor' ? 'gate.text.visitor' : (s && s.status === 'expired') ? 'gate.text.expired' : 'gate.text.free';
    return '<div class="gate"><div class="blur" aria-hidden="true">' + teaserHtml + '</div><div class="gate-box"><div class="lock">' + ICON.lock + '</div><h3>' + t('gate.title') + '</h3><p class="muted">' + t(txt) + '</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      (lv === 'visitor' ? '<a class="btn btn-dark" href="' + href('login', { redirect: state.route + '/' + state.id }) + '">' + t('nav.login') + '</a>' : '') + '<a class="btn btn-primary" href="' + href('membership') + '">' + t('gate.upgrade') + '</a></div></div></div>';
  }
  function related(type, x, cardFn) {
    var rel = Repo.all(type).filter(function (y) { return y.id !== x.id && y.sector === x.sector; }).slice(0, 3);
    if (rel.length < 2) rel = Repo.all(type).filter(function (y) { return y.id !== x.id; }).slice(0, 3);
    return '<section class="section section-alt"><div class="wrap"><h2>' + t('d.related') + '</h2><div class="grid g3">' + rel.map(cardFn).join('') + '</div></div></section>';
  }
  function share() { return '<div class="share"><span class="small muted" style="align-self:center">' + t('d.share') + ':</span><a class="btn btn-ghost btn-sm" href="#" data-act="share" data-net="LinkedIn">LinkedIn</a><a class="btn btn-ghost btn-sm" href="#" data-act="share" data-net="WhatsApp">WhatsApp</a><a class="btn btn-ghost btn-sm" href="#" data-act="share" data-net="Email">Email</a></div>'; }
  function notFound() { return pageHead('nf.title', 'nf.text') + '<section class="section"><div class="wrap"><a class="btn btn-primary" href="' + href('') + '">' + t('nav.home') + '</a></div></section>'; }

  function intelDetail(id) {
    var x = Repo.get('intel', id); if (!x || x.status === 'trash') return notFound();
    var locked = x.premium && level() !== 'premium';
    var full = '<h2>' + t('d.keyPoints') + '</h2><ul class="points">' + (x.points || []).map(function (p) { return '<li>' + esc(L(p)) + '</li>'; }).join('') + '</ul>' +
      '<p>' + esc(L(x.summary)) + '</p>' + (x.imported ? '' : '<p><a class="btn btn-dark" href="#" data-act="download">⬇ ' + t('d.download') + '</a> <span class="badge b-sim">' + t('badge.simulated') + '</span></p>');
    return pageHead(L(x.title), null, [[t('nav.intelligence'), 'intel'], [L(x.title).slice(0, 40) + '…']], '<div style="margin-top:14px">' + badges(x) + '</div>') +
      '<section class="section" style="padding-top:32px"><div class="wrap detail"><article class="detail-main"><div class="card-media">' + img(x.img || 'hero') + '</div><div class="detail-body"><p class="lead">' + esc(L(x.summary)) + '</p>' + sourceBox(x) +
      (locked ? gate(full) : full) + '<hr style="border:0;border-top:1px solid var(--line);margin:24px 0">' + share() + '</div></article>' +
      '<aside><div class="side-box"><dl class="kv"><dt>' + t('d.published') + '</dt><dd>' + fdate(x.date) + '</dd><dt>' + t('d.category') + '</dt><dd>' + tax('intelCat', x.cat) + '</dd><dt>' + t('d.reportType') + '</dt><dd>' + tax('reportType', x.type) + '</dd><dt>' + t('d.sector') + '</dt><dd>' + tax('sector', x.sector) + '</dd><dt>' + t('d.location') + '</dt><dd>' + tax('location', x.loc) + '</dd><dt>' + t('list.access') + '</dt><dd>' + (x.premium ? t('badge.premium') : t('badge.free')) + '</dd></dl></div>' +
      (locked ? '' : '') + '<div class="side-box" style="background:var(--navy);color:#fff;border:0"><h3 style="color:#fff">' + t('home.member.title') + '</h3><p class="small" style="color:#D9D3EA">' + t('home.member.text') + '</p><a class="btn btn-primary btn-block" href="' + href('membership') + '">' + t('mem.choose') + '</a></div></aside></div></section>' + related('intel', x, intelCard);
  }
  function oppDetail(id) {
    var x = Repo.get('opp', id); if (!x || x.status === 'trash') return notFound();
    var locked = x.premium && level() !== 'premium';
    var days = x.close ? Math.ceil((new Date(x.close) - new Date()) / 864e5) : null;
    var docs = '<h2>' + t('d.documents') + '</h2><ul class="points"><li>' + esc(L(x.title)).slice(0, 50) + '… : Scope of work.pdf <span class="badge b-sim">' + t('badge.simulated') + '</span></li><li>Prequalification questionnaire.docx <span class="badge b-sim">' + t('badge.simulated') + '</span></li></ul>' +
      '<h2>' + t('d.howToApply') + '</h2><p>' + esc(x.org) + ': procurement@' + (x.org || 'buyer').toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '') + '.example.test</p>';
    return pageHead(L(x.title), null, [[t('nav.opportunities'), 'opps'], [L(x.title).slice(0, 40) + '…']], '<div style="margin-top:14px" class="badges">' + statusBadge(x) + '<span class="badge b-sector">' + tax('oppType', x.type) + '</span>' + badges(x).replace(/^<div class="badges">|<\/div>$/g, '') + '</div>') +
      '<section class="section" style="padding-top:32px"><div class="wrap detail"><article class="detail-main"><div class="detail-body"><p class="lead">' + esc(L(x.desc || x.summary)) + '</p>' + sourceBox(x) + (locked ? gate(docs) : docs) + '<hr style="border:0;border-top:1px solid var(--line);margin:24px 0">' + share() + '</div></article>' +
      '<aside><div class="side-box" style="border-top:4px solid var(--orange)"><span class="small muted">' + t('d.closing') + '</span><div style="font-family:var(--font-display);font-size:1.8rem;font-weight:700">' + (x.close ? fdate(x.close) : '–') + '</div>' + (days != null && days >= 0 ? '<b style="color:var(--orange-d)">' + t('d.daysLeft', { n: days }) + '</b>' : '') + '</div>' +
      '<div class="side-box"><dl class="kv"><dt>' + t('d.organisation') + '</dt><dd>' + esc(x.org) + '</dd><dt>' + t('d.oppType') + '</dt><dd>' + tax('oppType', x.type) + '</dd><dt>' + t('d.sector') + '</dt><dd>' + tax('sector', x.sector) + '</dd><dt>' + t('d.location') + '</dt><dd>' + tax('location', x.loc) + '</dd><dt>' + t('d.opening') + '</dt><dd>' + fdate(x.date) + '</dd><dt>' + t('list.status') + '</dt><dd>' + statusBadge(x) + '</dd></dl></div></aside></div></section>' + related('opp', x, oppCard).replace('grid g3', 'grid');
  }
  function supDetail(id) {
    var x = Repo.get('supplier', id); if (!x || x.status === 'trash') return notFound();
    var lv = level();
    var contact = lv === 'premium' ? '<dl class="kv"><dt>Email</dt><dd>info@' + x.name.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14) + '.example.test</dd><dt>Tel.</dt><dd>+258 84 000 0000</dd><dt>' + t('d.website') + '</dt><dd>www.' + x.name.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14) + '.example.test</dd></dl><button class="btn btn-primary btn-block" style="margin-top:12px" data-act="contact-supplier">' + t('d.contactSupplier') + '</button>'
      : '<p class="small muted">' + ICON.lock + ' ' + t('d.membersOnlyContact') + '</p><a class="btn btn-primary btn-block" href="' + href(lv === 'visitor' ? 'login' : 'membership', lv === 'visitor' ? { redirect: 'suppliers/' + id } : null) + '">' + t(lv === 'visitor' ? 'nav.login' : 'gate.upgrade') + '</a>';
    return '<section class="page-head"><div class="wrap"><div class="crumbs"><a href="' + href('') + '">' + t('nav.home') + '</a> / <a href="' + href('suppliers') + '">' + t('nav.suppliers') + '</a> / ' + esc(x.name) + '</div><div class="sup-head"><div class="sup-logo" style="background:' + x.color + ';width:78px;height:78px;font-size:1.8rem;border:3px solid rgba(255,255,255,.2)">' + initials(x.name) + '</div><div><h1 style="margin:0">' + esc(x.name) + '</h1><p>' + ICON.pin + ' ' + esc(x.city) + ', ' + tax('location', x.loc) + '</p></div></div><div style="margin-top:12px" class="badges"><span class="badge b-sample">' + t('badge.sample') + '</span>' + (x.local ? '<span class="badge b-free">' + t('d.localContent') + '</span>' : '') + '</div></div></section>' +
      '<section class="section" style="padding-top:32px"><div class="wrap detail"><article class="detail-main"><div class="detail-body"><h2>' + t('d.overview') + '</h2><p class="lead">' + esc(L(x.overview)) + '</p><h2>' + t('d.services') + '</h2><div class="badges" style="margin-bottom:20px">' + x.services.map(function (s) { return '<span class="badge b-sector" style="font-size:.85rem;padding:6px 12px">' + tax('service', s) + '</span>'; }).join('') + '</div>' +
      '<h2>' + t('d.certs') + '</h2><p>' + (x.certs.length ? x.certs.join(' · ') : '–') + '</p><h2>' + t('d.location') + '</h2><div style="border-radius:12px;overflow:hidden;height:220px">' + img(x.loc === 'cabo-delgado' ? 'pemba' : x.loc === 'inhambane' ? 'pande' : 'people') + '</div><p class="small muted" style="margin-top:6px">Map embed (OpenStreetMap) in production <span class="badge b-sim">' + t('badge.simulated') + '</span></p></div></article>' +
      '<aside><div class="side-box"><h3>' + t('d.contact') + '</h3>' + contact + '</div><div class="side-box"><dl class="kv"><dt>' + t('d.sector') + '</dt><dd>' + tax('sector', x.sector) + '</dd><dt>' + t('d.founded') + '</dt><dd>' + x.founded + '</dd><dt>' + t('d.employees') + '</dt><dd>' + x.staff + '</dd><dt>' + t('d.localContent') + '</dt><dd>' + (x.local ? '✓' : '–') + '</dd></dl></div></aside></div></section>' + related('supplier', x, supCard);
  }
  function newsDetail(id) {
    var x = Repo.get('news', id); if (!x || x.status === 'trash') return notFound();
    return pageHead(L(x.title), null, [[t('nav.news'), 'news'], [L(x.title).slice(0, 40) + '…']], '<div style="margin-top:14px">' + badges(x, 'nofree') + '</div>') +
      '<section class="section" style="padding-top:32px"><div class="wrap detail"><article class="detail-main"><div class="card-media">' + img(x.img || 'pemba') + '</div><div class="detail-body"><p class="small muted">' + fdate(x.date) + ' · ' + tax('newsCat', x.cat) + ' · OilSkill Editorial</p><p class="lead">' + esc(L(x.summary)) + '</p>' + sourceBox(x) +
      (x.source ? '<p class="muted small">Imported items show the source excerpt and link to the original publisher, per the agreed republication terms.</p>' : '<p>' + esc(L(x.summary)) + '</p><p class="muted">Full article body is managed in the WordPress editor (Gutenberg) and translated per language in WPML.</p>') + '<hr style="border:0;border-top:1px solid var(--line);margin:24px 0">' + share() + '</div></article>' +
      '<aside><div class="side-box"><h3>' + t('home.newsletter.title') + '</h3><p class="small muted">' + t('home.newsletter.text') + '</p><form data-form="newsletter"><input type="email" required placeholder="' + t('f.email') + '" style="margin-bottom:8px"><button class="btn btn-primary btn-block">' + t('home.newsletter.btn') + '</button></form></div></aside></div></section>' + related('news', x, newsCard);
  }
  function webDetail(id) {
    var x = Repo.get('webinar', id); if (!x || x.status === 'trash') return notFound();
    var u = me(), lv = level(), past = new Date(x.start) < new Date();
    var regs = Store.get('regs', []), mine = u && regs.some(function (r) { return r.webinar === id && r.email === u.email; });
    var action;
    if (x.premium && lv !== 'premium') action = '<p class="small muted">' + ICON.lock + ' ' + t('d.membersOnly') + '</p><a class="btn btn-primary btn-block" href="' + href(lv === 'visitor' ? 'login' : 'membership', lv === 'visitor' ? { redirect: 'webinars/' + id } : null) + '">' + t(lv === 'visitor' ? 'nav.login' : 'gate.upgrade') + '</a>';
    else if (past) action = x.recording ? '<a class="btn btn-dark btn-block" href="' + x.recording + '" target="_blank" rel="noopener">▶ ' + t('d.recording') + '</a><p class="small muted" style="margin-top:6px">External recording link <span class="badge b-sim">' + t('badge.simulated') + '</span></p>' : '';
    else if (x.mode === 'external') action = '<a class="btn btn-primary btn-block" href="' + x.url + '" target="_blank" rel="noopener">' + t('d.register') + ' ↗</a><p class="small muted" style="margin-top:8px">Redirects to ' + esc(x.platform) + ' registration page (external platform UI language is controlled by ' + esc(x.platform) + ').</p>';
    else if (mine) action = '<div class="notice notice-ok">' + t('ok.alreadyReg') + '</div>';
    else action = '<form data-form="webreg" data-id="' + id + '" novalidate>' +
      fld('name', 'f.name', 'text', u ? u.first + ' ' + u.last : '', true) + fld('email', 'f.email', 'email', u ? u.email : '', true) + fld('org', 'f.org', 'text', u ? u.org : '', false) +
      '<button class="btn btn-primary btn-block">' + t('d.register') + '</button></form>';
    return pageHead(L(x.title), null, [[t('nav.webinars'), 'webinars'], [L(x.title).slice(0, 40) + '…']], '<div style="margin-top:14px">' + badges(x) + '</div>') +
      '<section class="section" style="padding-top:32px"><div class="wrap detail"><article class="detail-main"><div class="card-media">' + img(x.img || 'people') + '</div><div class="detail-body"><p class="lead">' + esc(L(x.summary)) + '</p><h2>' + t('d.speakers') + '</h2>' +
      x.speakers.map(function (s) { return '<div class="sup-head" style="margin-bottom:12px"><div class="sup-logo" style="background:var(--navy-3);border-radius:50%">' + initials(s.name) + '</div><div><b>' + esc(s.name) + '</b><div class="small muted">' + esc(L(s.role)) + '</div></div></div>'; }).join('') +
      '<h2>' + t('d.resources') + '</h2><ul class="points"><li>Presentation slides (PDF) <span class="badge b-sim">' + t('badge.simulated') + '</span></li></ul></div></article>' +
      '<aside><div class="side-box" style="border-top:4px solid var(--orange)"><dl class="kv"><dt>' + t('d.dateTime') + '</dt><dd>' + I18N.dateTime(x.start, state.lang) + '</dd><dt></dt><dd class="small muted">' + t('d.timezone') + '</dd><dt>' + t('d.platform') + '</dt><dd>' + esc(x.platform) + '</dd><dt>' + t('d.category') + '</dt><dd>' + tax('webCat', x.cat) + '</dd><dt>' + t('list.access') + '</dt><dd>' + (x.premium ? t('d.membersOnly') : t('badge.free')) + '</dd></dl></div><div class="side-box">' + action + '</div></aside></div></section>' + related('webinar', x, webCard);
  }

  /* ---------------- home (content from admin → Pages → Home) ---------------- */
  function customImg(url, alt) {
    return '<div class="ph" role="img" aria-label="' + esc(alt) + '">' + art('flng') + '<img src="' + esc(url) + '" alt="' + esc(alt) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()"></div>';
  }
  function linkTo(v) { v = (v || '').trim(); return /^(https?:|mailto:)/.test(v) ? esc(v) : href(v.replace(/^#?\/?((en|pt|fr)\/)?/, '')); }
  function secHead(s, more) {
    return '<div class="sec-head"><div>' + (L(s.eyebrow) ? '<span class="eyebrow">' + esc(L(s.eyebrow)) + '</span>' : '') + '<h2>' + esc(L(s.heading)) + '</h2></div>' + (more ? '<a class="btn btn-ghost" href="' + href(more) + '">' + t('home.viewAll') + ' →</a>' : '') + '</div>';
  }
  function home() {
    var H = HomeCfg.get(), hero = H.hero;
    var opps = Repo.all('opp'), openN = opps.filter(function (o) { return oppStatus(o) !== 'closed'; }).length;
    var im = D.IMAGES[hero.img] || D.IMAGES.hero;
    var caption = L(hero.caption) || (hero.imgUrl ? '' : t('badge.illustrative') + ': ' + L(im.subject) + ' · ' + im.place + '. Licensed photo to be supplied (' + im.credit + ').');
    var out = '<section class="hero"><div class="hero-media">' + (hero.imgUrl ? customImg(hero.imgUrl, L(hero.title)) : img(hero.img || 'hero', { eager: true, noTag: true })) + '</div><div class="wrap">' +
      (L(hero.eyebrow) ? '<span class="eyebrow">' + esc(L(hero.eyebrow)) + '</span>' : '') + '<h1>' + esc(L(hero.title)) + '</h1>' + (L(hero.text) ? '<p class="lead">' + esc(L(hero.text)) + '</p>' : '') +
      '<div class="hero-actions">' + (L(hero.cta1) ? '<a class="btn btn-primary" href="' + linkTo(hero.cta1Link) + '">' + esc(L(hero.cta1)) + '</a>' : '') + (L(hero.cta2) ? '<a class="btn btn-outline-light" href="' + linkTo(hero.cta2Link) + '">' + esc(L(hero.cta2)) + '</a>' : '') + '</div>' +
      (hero.showSearch ? '<form class="hero-search" data-form="hero-search" role="search"><label class="sr-only" for="hs">' + t('nav.search') + '</label><input id="hs" name="q" type="search" placeholder="' + esc(L(hero.search)) + '"><button class="btn btn-primary">' + ICON.search + '<span>' + t('nav.search') + '</span></button></form>' : '') + '</div>' +
      (caption ? '<div class="hero-caption">' + esc(caption) + '</div>' : '') + '</section>';

    var R = {
      stats: function (s, i) {
        return '<div class="wrap"><div class="stats' + (i === 0 ? '' : ' stats-flat') + '"><div class="stat"><b>' + openN + '</b><span>' + t('home.stats.opps') + '</span></div><div class="stat"><b>' + Repo.all('supplier').length + '</b><span>' + t('home.stats.suppliers') + '</span></div><div class="stat"><b>' + Repo.all('intel').length + '</b><span>' + t('home.stats.reports') + '</span></div><div class="stat"><b>3</b><span>' + t('home.stats.langs') + ': EN · PT · FR</span></div></div></div>';
      },
      opps: function (s) {
        var list = sortItems(opps.filter(function (o) { return oppStatus(o) !== 'closed'; }), 'newest').slice(0, +s.count || 4);
        return '<section class="section"><div class="wrap">' + secHead(s, 'opps') + '<div class="grid g2">' + list.map(oppCard).join('') + '</div></div></section>';
      },
      projects: function (s) {
        return '<section class="section section-dark"><div class="wrap"><div class="sec-head"><div>' + (L(s.eyebrow) ? '<span class="eyebrow" style="color:var(--gold)">' + esc(L(s.eyebrow)) + '</span>' : '') + '<h2>' + esc(L(s.heading)) + '</h2>' + (L(s.intro) ? '<p style="color:#CFC8E3">' + esc(L(s.intro)) + '</p>' : '') + '</div></div><div class="grid g4">' +
          H.projects.map(function (p) { return '<article class="proj"><div class="card-media">' + img(p.img || 'hero') + '</div><div class="proj-body"><h3>' + esc(p.name) + '</h3><div class="op">' + esc(p.operator) + '</div><p>' + esc(L(p.text)) + '</p><div class="proj-loc">' + ICON.pin + tax('location', p.loc) + '</div></div></article>'; }).join('') + '</div></div></section>';
      },
      intel: function (s) {
        var all = Repo.all('intel'), n = +s.count || 3;
        var list = s.mode === 'pick' && s.pick && s.pick.length ? s.pick.map(function (id) { return all.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean).slice(0, n) : sortItems(all, 'newest').slice(0, n);
        return '<section class="section"><div class="wrap">' + secHead(s, 'intel') + '<div class="grid g3">' + list.map(intelCard).join('') + '</div></div></section>';
      },
      audience: function (s) {
        return '<section class="section section-alt"><div class="wrap">' + secHead(s) + '<div class="grid g4">' +
          [['investors', ICON.chart], ['operators', ICON.plant], ['suppliers', ICON.box], ['professionals', ICON.hat]].map(function (a) { return '<div class="aud"><div class="ic">' + a[1] + '</div><h3>' + t('aud.' + a[0]) + '</h3><p>' + t('aud.' + a[0] + '.t') + '</p></div>'; }).join('') + '</div></div></section>';
      },
      suppliers: function (s) {
        var all = Repo.all('supplier'), f = all.filter(function (x) { return x.featured; });
        var list = (f.length ? f : all).slice(0, +s.count || 4);
        return '<section class="section"><div class="wrap">' + secHead(s, 'suppliers') + '<div class="grid g2">' + list.map(supCard).join('') + '</div></div></section>';
      },
      newsweb: function (s) {
        var n = +s.count || 3, news = sortItems(Repo.all('news'), 'newest').slice(0, n);
        var webs = Repo.all('webinar').filter(function (w) { return new Date(w.start) > new Date(); }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); }).slice(0, n);
        return '<section class="section section-alt"><div class="wrap"><div class="grid g2" style="gap:40px"><div><div class="sec-head"><h2>' + esc(L(s.heading)) + '</h2><a href="' + href('news') + '">' + t('home.viewAll') + ' →</a></div>' +
          news.map(function (x) { return '<div style="padding:14px 0;border-bottom:1px solid var(--line)"><div class="small muted">' + fdate(x.date) + ' · ' + tax('newsCat', x.cat) + '</div><h3 style="font-size:1.15rem;margin:4px 0"><a href="' + href('news/' + x.id) + '">' + esc(L(x.title)) + '</a></h3>' + badges(x, 'nofree') + '</div>'; }).join('') + '</div>' +
          '<div><div class="sec-head"><h2>' + esc(L(s.heading2)) + '</h2><a href="' + href('webinars') + '">' + t('home.viewAll') + ' →</a></div>' +
          webs.map(function (w) { var dt = new Date(w.start); return '<div style="display:flex;gap:16px;padding:14px 0;border-bottom:1px solid var(--line)"><div style="background:var(--navy);color:#fff;border-radius:12px;padding:8px 12px;text-align:center;min-width:64px;font-family:var(--font-display)"><div style="font-size:1.6rem;font-weight:700;line-height:1">' + dt.getDate() + '</div><div style="font-size:.75rem;text-transform:uppercase;color:var(--gold)">' + I18N.date(w.start, state.lang, { month: 'short' }) + '</div></div><div><h3 style="font-size:1.12rem;margin:0 0 4px"><a href="' + href('webinars/' + w.id) + '">' + esc(L(w.title)) + '</a></h3><div class="small muted">' + I18N.dateTime(w.start, state.lang) + ' CAT · ' + esc(w.platform) + '</div>' + badges(w) + '</div></div>'; }).join('') + '</div></div></div></section>';
      },
      cta: function (s) {
        return '<section class="section"><div class="wrap"><div class="cta-band"' + (s.showNewsletter ? '' : ' style="grid-template-columns:1fr"') + '><div>' + (L(s.eyebrow) ? '<span class="eyebrow" style="color:var(--gold)">' + esc(L(s.eyebrow)) + '</span>' : '') + '<h2>' + esc(L(s.heading)) + '</h2><p>' + esc(L(s.intro)) + '</p><a class="btn btn-primary" href="' + href('membership') + '">' + esc(L(s.btn)) + '</a></div>' +
          (s.showNewsletter ? '<div style="position:relative;z-index:2"><h3>' + esc(L(s.heading2)) + '</h3><p class="small">' + esc(L(s.intro2)) + '</p><form data-form="newsletter"><label class="sr-only" for="nl">' + t('f.email') + '</label><input id="nl" type="email" required placeholder="' + t('f.email') + '"><button class="btn btn-light">' + t('home.newsletter.btn') + '</button></form><p class="small" style="margin-top:8px"><span class="badge b-sim">' + t('badge.simulated') + '</span> Mailchimp/Brevo integration</p></div>' : '') + '</div></div></section>';
      }
    };
    H.sections.filter(function (s) { return s.show && R[s.id]; }).forEach(function (s, i) { out += R[s.id](s, i); });
    if (Store.get('adminSession') && !/[?&]embed=1/.test(location.search)) out += '<a class="edit-fab" href="admin.html#/pages/home" target="_blank" rel="noopener">✎ Edit this page</a>';
    return out;
  }

  /* ---------------- static pages ---------------- */
  function about() {
    return pageHead('about.title', 'site.descriptor', [[t('nav.about')]]) + '<section class="section"><div class="wrap"><div class="notice notice-info">' + t('about.note') + '</div><div class="grid g2" style="gap:40px;align-items:center"><div><span class="eyebrow">OilSkill Co.</span><h2>' + t('about.mission') + '</h2><p class="lead" style="font-size:1.15rem">' + t('about.mission.t') + '</p><h3>' + t('about.focus') + '</h3><p>' + t('about.focus.t') + '</p><h3>' + t('about.purpose') + '</h3><p>' + t('about.purpose.t') + '</p><a class="btn btn-primary" href="' + href('register') + '">' + t('nav.join') + '</a> <a class="btn btn-ghost" href="' + href('contact') + '">' + t('nav.contact') + '</a></div>' +
      '<div style="border-radius:20px;overflow:hidden;aspect-ratio:4/3;position:relative">' + img('people') + '</div></div></div></section>' +
      '<section class="section section-alt"><div class="wrap"><h2>' + t('about.stakeholders') + '</h2><div class="grid g4">' + [['investors', ICON.chart], ['operators', ICON.plant], ['suppliers', ICON.box], ['professionals', ICON.hat]].map(function (a) { return '<div class="aud"><div class="ic">' + a[1] + '</div><h3>' + t('aud.' + a[0]) + '</h3><p>' + t('aud.' + a[0] + '.t') + '</p></div>'; }).join('') + '</div></div></section>';
  }
  function legal(kind) {
    var secs = kind === 'privacy' ? ['Data we collect', 'How we use member data', 'Payments (processed by the payment gateway; card data is never stored on OilSkill servers)', 'Cookies and analytics (GA4, consent-based)', 'Your rights and contact'] : ['Use of the platform', 'Membership and subscriptions', 'Recurring billing, renewal and cancellation', 'Content access and permitted use', 'Liability and governing law'];
    return pageHead(kind + '.title', null, [[t(kind + '.title')]]) + '<section class="section"><div class="wrap" style="max-width:820px"><div class="notice notice-warn">' + t('legal.draft') + '</div>' + secs.map(function (s, i) { return '<h2 style="font-size:1.4rem">' + (i + 1) + '. ' + s + '</h2><p class="muted">Placeholder text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Final wording to be supplied by OilSkill legal counsel and translated into Portuguese and French.</p>'; }).join('') + '</div></section>';
  }
  function credits() {
    return pageHead('credits.title', 'credits.intro', [[t('credits.title')]]) + '<section class="section"><div class="wrap"><div class="notice notice-warn">Status “to source”: the prototype shows illustrated placeholders. Licensed photographs will be placed in <span class="code">assets/img/photos/</span> with the file names below, and credits will appear automatically.</div><div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Preview</th><th>Subject</th><th>Actual location / project</th><th>Proposed source</th><th>Credit</th><th>File</th></tr></thead><tbody>' +
      Object.keys(D.IMAGES).map(function (k) { var im = D.IMAGES[k]; return '<tr><td style="width:120px"><div style="width:110px;height:62px;border-radius:8px;overflow:hidden;position:relative">' + img(k, { noTag: true }) + '</div></td><td>' + esc(L(im.subject)) + '</td><td>' + esc(im.place) + '</td><td>' + esc(im.source) + '</td><td>' + esc(im.credit) + '</td><td><span class="code">' + esc(im.file.split('/').pop()) + '</span></td></tr>'; }).join('') + '</tbody></table></div></div></section>';
  }

  /* ---------------- forms helpers ---------------- */
  function fld(name, labelKey, type, val, req, extra) {
    return '<div class="field" data-f="' + name + '"><label for="i-' + name + '">' + t(labelKey) + (req ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</label><input id="i-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(val || '') + '"' + (req ? ' required aria-required="true"' : '') + (extra || '') + '><div class="field-err" role="alert"></div></div>';
  }
  function sel(name, labelKey, opts, val, req) {
    return '<div class="field" data-f="' + name + '"><label for="i-' + name + '">' + t(labelKey) + (req ? ' <span class="req">*</span>' : '') + '</label><select id="i-' + name + '" name="' + name + '"' + (req ? ' required' : '') + '><option value="">' + t('f.select') + '</option>' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select><div class="field-err" role="alert"></div></div>';
  }
  function setErr(form, name, key) { var f = form.querySelector('[data-f="' + name + '"]'); if (!f) return; f.classList.add('has-err'); f.querySelector('.field-err').textContent = t(key); var i = f.querySelector('input,select,textarea'); if (i) i.setAttribute('aria-invalid', 'true'); }
  function clearErr(form) { form.querySelectorAll('.has-err').forEach(function (f) { f.classList.remove('has-err'); var i = f.querySelector('input,select,textarea'); if (i) i.removeAttribute('aria-invalid'); }); var n = form.querySelector('.form-notice'); if (n) n.innerHTML = ''; }
  function formErr(form) { var n = form.querySelector('.form-notice'); if (n) n.innerHTML = '<div class="notice notice-err" role="alert">' + t('err.form') + '</div>'; var f = form.querySelector('.has-err input, .has-err select'); if (f) f.focus(); }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function strong(p) { return p.length >= 8 && /\d/.test(p) && /[A-Z]/.test(p); }
  var COUNTRIES = [['Mozambique', 'Moçambique / Mozambique'], ['South Africa', 'South Africa / África do Sul'], ['Portugal', 'Portugal'], ['France', 'France / França'], ['Angola', 'Angola'], ['Tanzania', 'Tanzania'], ['United Kingdom', 'United Kingdom'], ['Other', 'Other / Outro / Autre']];

  /* ---------------- auth ---------------- */
  function register() {
    var p = state.q.plan || '';
    var paid = p && p !== 'free';
    return pageHead('reg.title', 'reg.intro', [[t('reg.title')]]) + '<section class="section"><div class="wrap"><form class="auth wide" data-form="register" novalidate><div class="form-notice"></div>' +
      (paid ? '<div class="notice notice-info">' + t('f.plan') + ': <b>' + esc(planName(p)) + '</b> · ' + I18N.money(plan(p).price, state.lang) + '</div>' : '') +
      '<div class="form-grid">' + fld('first', 'f.first', 'text', '', true, ' autocomplete="given-name"') + fld('last', 'f.last', 'text', '', true, ' autocomplete="family-name"') +
      '<div class="full">' + fld('email', 'f.email', 'email', '', true, ' autocomplete="email"') + '</div>' +
      '<div><div class="field" data-f="password"><label for="i-password">' + t('f.password') + ' <span class="req">*</span></label><input id="i-password" name="password" type="password" required autocomplete="new-password"><div class="meter" aria-hidden="true"><i id="meter"></i></div><div class="small muted" id="meter-l">' + t('f.strength') + '</div><div class="field-err" role="alert"></div></div></div>' +
      fld('password2', 'f.password2', 'password', '', true, ' autocomplete="new-password"') + fld('org', 'f.org', 'text', '', true) + fld('job', 'f.job', 'text', '', false) +
      sel('country', 'f.country', COUNTRIES, 'Mozambique', true) + sel('sector', 'f.sectorInterest', options('sector'), '', false) +
      sel('lang', 'f.prefLang', I18N.langs.map(function (l) { return [l, I18N.meta[l].label]; }), state.lang, true) +
      sel('plan', 'f.plan', D.PLANS.map(function (x) { return [x.id, planName(x.id) + (x.price ? ' · ' + I18N.money(x.price, state.lang) : '')]; }), p || 'free', true) +
      '<div class="full"><div class="field" data-f="terms"><label class="check"><input type="checkbox" name="terms"> <span>' + t('f.terms').replace(t('terms.title'), '<a href="' + href('terms') + '" target="_blank">' + t('terms.title') + '</a>').replace(t('privacy.title'), '<a href="' + href('privacy') + '" target="_blank">' + t('privacy.title') + '</a>') + ' <span class="req">*</span></span></label><div class="field-err" role="alert"></div></div>' +
      '<label class="check" style="margin-bottom:18px"><input type="checkbox" name="marketing"> <span>' + t('f.marketing') + '</span></label>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-5000px" aria-hidden="true">' +
      '<button class="btn btn-primary btn-block" id="reg-submit">' + t(paid ? 'reg.submitPay' : 'reg.submit') + '</button><p class="divider">' + t('f.haveAccount') + ' <a href="' + href('login') + '">' + t('nav.login') + '</a></p></div></div></form></div></section>';
  }
  function login() {
    return pageHead('login.title', null, [[t('nav.login')]]) + '<section class="section"><div class="wrap"><form class="auth" data-form="login" novalidate>' + takeFlash() + '<div class="form-notice"></div>' +
      (state.q.redirect ? '<div class="notice notice-info">' + t('msg.loginRequired') + '</div>' : '') +
      fld('email', 'f.email', 'email', '', true, ' autocomplete="username"') + fld('password', 'f.password', 'password', '', true, ' autocomplete="current-password"') +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:8px"><label class="check"><input type="checkbox" name="remember" checked> ' + t('f.remember') + '</label><a href="' + href('forgot') + '" class="small">' + t('f.forgot') + '</a></div>' +
      '<button class="btn btn-primary btn-block">' + t('login.submit') + '</button><p class="divider">' + t('f.noAccount') + ' <a href="' + href('register') + '">' + t('f.createAccount') + '</a></p>' +
      '<div class="notice notice-info small" style="margin:0">' + t('login.demoHint') + ' <a href="' + href('guide') + '">' + t('demo.guide') + ' →</a><br><span class="code">pro@oilskill-demo.test</span> / <span class="code">Member@2026</span></div></form></div></section>';
  }
  function forgot() {
    return pageHead('forgot.title', null, [[t('forgot.title')]]) + '<section class="section"><div class="wrap"><form class="auth" data-form="forgot" novalidate><p class="muted">' + t('forgot.intro') + '</p><div class="form-notice"></div><div id="forgot-out"></div>' + fld('email', 'f.email', 'email', '', true) + '<button class="btn btn-primary btn-block">' + t('forgot.submit') + '</button><p class="divider"><a href="' + href('login') + '">← ' + t('nav.login') + '</a></p></form></div></section>';
  }
  function reset() {
    return pageHead('reset.title', null, [[t('reset.title')]]) + '<section class="section"><div class="wrap"><form class="auth" data-form="reset" novalidate><div class="form-notice"></div>' + fld('password', 'f.newPassword', 'password', '', true) + fld('password2', 'f.password2', 'password', '', true) + '<button class="btn btn-primary btn-block">' + t('reset.submit') + '</button></form></div></section>';
  }

  /* ---------------- membership & checkout ---------------- */
  function membership() {
    var cyc = state.q.cycle || 'month', u = me(), s = u && Store.subFor(u.id);
    var cur = s && (s.status === 'active' || s.status === 'cancelled') ? s.plan : (u ? 'free' : null);
    var pro = plan(cyc === 'year' ? 'pro_annual' : 'pro_monthly');
    var cards = [plan('free'), pro, plan('corporate')].map(function (p, i) {
      var isCur = cur === p.id || (cur && p.group && plan(cur) && plan(cur).group === p.group);
      var feats = (p.features || plan('pro_monthly').features);
      var btn = isCur ? '<span class="btn btn-ghost btn-block" aria-disabled="true">✓ ' + t('mem.current') + '</span>'
        : p.id === 'free' ? (u ? '' : '<a class="btn btn-ghost btn-block" href="' + href('register', { plan: 'free' }) + '">' + t('mem.choose') + '</a>')
        : '<a class="btn ' + (i === 1 ? 'btn-primary' : 'btn-dark') + ' btn-block" href="' + href(u ? 'checkout/' + p.id : 'register', u ? null : { plan: p.id }) + '">' + t('mem.choose') + '</a>';
      return '<div class="plan' + (i === 1 ? ' hl' : '') + '">' + (i === 1 ? '<span class="pop">' + t('mem.popular') + '</span>' : '') + '<h3>' + esc(L(p.name)) + '</h3><div class="price">' + (p.price ? I18N.money(p.price, state.lang) : t('mem.free')) + ' <small>' + (p.cycle ? t(p.cycle === 'month' ? 'mem.perMonth' : 'mem.perYear') : '') + '</small></div>' + (p.id === 'pro_annual' ? '<span class="badge b-free" style="margin-top:8px;align-self:flex-start">' + t('mem.save') + '</span>' : '') +
        '<ul>' + feats.map(function (f) { return '<li>' + esc(L(f)) + '</li>'; }).join('') + '</ul>' + btn + '</div>';
    }).join('');
    return pageHead('mem.title', 'mem.intro', [[t('nav.membership')]]) + '<section class="section"><div class="wrap">' + takeFlash() +
      '<div class="plan-toggle"><div class="tabs"><a href="' + href('membership', { cycle: 'month' }) + '" class="' + (cyc === 'month' ? 'on' : '') + '">' + t('mem.monthly') + '</a><a href="' + href('membership', { cycle: 'year' }) + '" class="' + (cyc === 'year' ? 'on' : '') + '">' + t('mem.annual') + ' · ' + t('mem.save') + '</a></div></div>' +
      '<div class="plans">' + cards + '</div><p class="small muted" style="text-align:center;margin-top:18px"><span class="badge b-sample">' + t('badge.sample') + '</span> ' + t('co.taxNote') + '</p></div></section>' +
      '<section class="section section-alt"><div class="wrap" style="max-width:820px"><h2>' + t('mem.faq.title') + '</h2>' + [1, 2, 3].map(function (n) { return '<details class="panel" style="margin-bottom:10px"' + (n === 1 ? ' open' : '') + '><summary style="cursor:pointer;font-weight:600">' + t('mem.faq.q' + n) + '</summary><p style="margin:10px 0 0" class="muted">' + t('mem.faq.a' + n) + '</p></details>'; }).join('') + '</div></section>';
  }
  function checkout(pid) {
    var u = me(); if (!u) { go('register', { plan: pid }); return ''; }
    var p = plan(pid); if (!p || !p.price) return notFound();
    return pageHead('co.title', null, [[t('nav.membership'), 'membership'], [t('co.title')]]) + '<section class="section"><div class="wrap"><form class="auth" data-form="checkout" data-plan="' + pid + '" novalidate><div class="form-notice"></div><h2 style="font-size:1.5rem">' + t('co.summary') + '</h2>' +
      '<dl class="kv" style="margin-bottom:18px"><dt>' + t('co.plan') + '</dt><dd>' + esc(planName(pid)) + '</dd><dt>' + t('co.billing') + '</dt><dd>' + t('co.recurring') + '</dd><dt>' + t('f.email') + '</dt><dd>' + esc(u.email) + '</dd></dl>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid var(--line);padding-top:14px;margin-bottom:6px"><b>' + t('co.total') + '</b><span class="price" style="font-size:2rem">' + I18N.money(p.price, state.lang) + '</span></div><p class="small muted">' + t('co.taxNote') + '</p>' +
      '<div class="field" data-f="agree"><label class="check"><input type="checkbox" name="agree"> <span>' + t('co.agree') + ' <span class="req">*</span></span></label><div class="field-err" role="alert"></div></div>' +
      '<div class="notice notice-info small">' + t('co.gateway') + '<br>' + t('co.thirdParty') + '</div><button class="btn btn-primary btn-block">🔒 ' + t('co.pay') + '</button><p class="small muted" style="text-align:center;margin-top:10px"><span class="badge b-sim">' + t('badge.simulated') + '</span> PayFast sandbox flow</p></form></div></section>';
  }
  function gateway(pid) {
    var u = me(), p = plan(pid); if (!u || !p) return notFound();
    document.body.classList.add('gw-mode');
    return '<div class="gw"><div class="gw-top"><span class="gw-logo">🔒 Secure payment gateway</span><span class="gw-sbx">SANDBOX · SIMULATED</span><span style="margin-left:auto;font-size:.8rem;color:#666">Prototype stand-in for the hosted gateway checkout (proposed: PayFast; English only)</span></div>' +
      '<div class="gw-card"><h2>Payment to OilSkill Co.</h2><div class="gw-row"><span>Item</span><b>' + esc(L(p.name, 'en')) + ' membership (' + p.cycle + 'ly)</b></div><div class="gw-row"><span>Amount</span><b>ZAR ' + p.price.toFixed(2) + '</b></div><div class="gw-row"><span>Subscription</span><b>Recurring, every ' + p.cycle + '</b></div><div class="gw-row"><span>Buyer</span><b>' + esc(u.email) + '</b></div>' +
      '<form data-form="gateway" data-plan="' + pid + '" style="margin-top:16px"><p style="font-size:.88rem;color:#555;margin-bottom:8px">Choose a sandbox test outcome:</p>' +
      '<label class="gw-opt"><input type="radio" name="o" value="success" checked> <span><b>Test card: approved</b><br><span style="color:#666;font-size:.82rem">Visa •••• 4242: payment completes, ITN “COMPLETE” sent to site</span></span></label>' +
      '<label class="gw-opt"><input type="radio" name="o" value="declined"> <span><b>Test card: declined</b><br><span style="color:#666;font-size:.82rem">Card •••• 0002: ITN “FAILED” sent to site</span></span></label>' +
      '<button class="gw-btn">Pay ZAR ' + p.price.toFixed(2) + '</button><a class="gw-cancel" href="#" data-act="gw-cancel" data-plan="' + pid + '">Cancel and return to merchant</a></form>' +
      '<p style="font-size:.75rem;color:#888;margin-top:16px;text-align:center">Production: real redirect to sandbox.payfast.co.za / www.payfast.co.za with signed request + ITN callback validation.</p></div></div>';
  }
  function result(kind) {
    var ref = state.q.ref || '', p = state.q.plan || '';
    var map = { success: ['ok', ICON.check, 'co.successTitle', 'co.successText'], failed: ['err', ICON.x, 'co.failTitle', 'co.failText'], cancelled: ['warn', ICON.warn, 'co.cancelTitle', 'co.cancelText'] };
    var m = map[kind] || map.cancelled;
    return '<section class="section"><div class="wrap"><div class="result panel" style="padding:40px"><div class="ic ' + m[0] + '">' + m[1] + '</div><h1 style="font-size:2rem">' + t(m[2]) + '</h1><p class="muted">' + t(m[3], { ref: ref, plan: planName(p) }) + '</p>' +
      (ref ? '<p class="small"><span class="code">' + esc(ref) + '</span></p>' : '') + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px">' +
      (kind === 'success' ? '<a class="btn btn-primary" href="' + href('account') + '">' + t('co.toDashboard') + '</a>' : '<a class="btn btn-primary" href="' + href('checkout/' + p) + '">' + t('co.retry') + '</a><a class="btn btn-ghost" href="' + href('account') + '">' + t('co.toDashboard') + '</a>') + '</div></div></div></section>';
  }

  /* ---------------- account ---------------- */
  function requireLogin() { if (!me()) { go('login', { redirect: 'account' }); return true; } return false; }
  function subStatus(s) { if (!s) return ['free', 'st.free']; return [s.status, 'st.' + s.status]; }
  function acctNav(on) {
    return '<nav class="acct-nav">' + [['account', 'dash.overview'], ['account/profile', 'dash.profile'], ['account/billing', 'dash.billing']].map(function (n) { return '<a href="' + href(n[0]) + '" class="' + (on === n[0] ? 'on' : '') + '">' + t(n[1]) + '</a>'; }).join('') + '<a href="' + href('membership') + '">' + t('nav.membership') + '</a><a href="#" data-act="logout">' + t('nav.logout') + '</a></nav>';
  }
  function dashboard() {
    if (requireLogin()) return '';
    var u = me(), s = Store.subFor(u.id), st = subStatus(s), lv = level();
    var notice = '';
    if (s && s.status === 'pending') notice = '<div class="notice notice-err">' + t('dash.failedNotice') + ' <a href="' + href('checkout/' + s.plan) + '">' + t('co.retry') + ' →</a></div>';
    if (s && s.status === 'cancelled') notice = '<div class="notice notice-warn">' + t('dash.cancelNotice', { d: fdate(s.expires) }) + '</div>';
    if (s && s.status === 'expired') notice = '<div class="notice notice-err">' + t('dash.expiredNotice', { d: fdate(s.expires) }) + ' <a href="' + href('checkout/' + s.plan) + '">' + t('dash.renewCta') + ' →</a></div>';
    var dateK = s && s.status === 'active' ? ['dash.renews', s.renews] : s && s.status === 'cancelled' ? ['dash.expires', s.expires] : s && s.status === 'expired' ? ['dash.expired', s.expires] : ['dash.renews', null];
    var premium = Repo.all('intel').filter(function (x) { return x.premium; }).slice(0, 3);
    var regs = Store.get('regs', []).filter(function (r) { return r.email === u.email; });
    var badge = st[0] === 'active' ? 'b-ok' : st[0] === 'cancelled' ? 'b-soon' : st[0] === 'free' ? 'b-sector' : 'b-err';
    return pageHead(t('dash.welcome', { name: u.first }), 'dash.title', [[t('nav.account')]]) + '<section class="section" style="padding-top:32px"><div class="wrap acct">' + acctNav('account') + '<div>' + takeFlash() + notice +
      '<div class="kpis"><div class="kpi"><span>' + t('dash.plan') + '</span><b>' + esc(s ? planName(s.plan) : L(plan('free').name)) + '</b></div><div class="kpi"><span>' + t('dash.status') + '</span><b><span class="badge ' + badge + '" style="font-size:.85rem">' + t(st[1]) + '</span></b></div><div class="kpi"><span>' + t(dateK[0]) + '</span><b>' + (dateK[1] ? fdate(dateK[1]) : '–') + '</b></div></div>' +
      (lv !== 'premium' ? '<div class="panel" style="background:var(--navy);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap"><div><h3 style="color:#fff;margin:0">' + t('home.member.title') + '</h3><p class="small" style="margin:4px 0 0;color:#D9D3EA">' + t('home.member.text') + '</p></div><a class="btn btn-primary" href="' + href('membership') + '">' + t(s && s.status === 'expired' ? 'dash.renewCta' : 'dash.upgradeCta') + '</a></div>' : '') +
      '<div class="panel"><h2>' + t('dash.premium') + '</h2>' + premium.map(function (x) { return '<div style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line);align-items:center"><div><a href="' + href('intel/' + x.id) + '"><b>' + esc(L(x.title)) + '</b></a><div class="small muted">' + fdate(x.date) + ' · ' + tax('sector', x.sector) + '</div></div>' + (lv === 'premium' ? '<span class="badge b-ok">✓</span>' : '<span class="badge b-premium">' + ICON.lock.replace(/22/g, '12') + ' ' + t('badge.premium') + '</span>') + '</div>'; }).join('') + '</div>' +
      '<div class="panel"><h2>' + t('dash.myWebinars') + '</h2>' + (regs.length ? regs.map(function (r) { var w = Repo.get('webinar', r.webinar); return w ? '<div style="padding:10px 0;border-bottom:1px solid var(--line)"><a href="' + href('webinars/' + w.id) + '"><b>' + esc(L(w.title)) + '</b></a><div class="small muted">' + I18N.dateTime(w.start, state.lang) + ' CAT</div></div>' : ''; }).join('') : '<p class="muted">' + t('dash.noWebinars') + '</p>') + '</div>' +
      '<div class="panel"><h2>' + t('dash.quick') + '</h2><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-ghost" href="' + href('opps') + '">' + t('nav.opportunities') + '</a><a class="btn btn-ghost" href="' + href('intel') + '">' + t('nav.intelligence') + '</a><a class="btn btn-ghost" href="' + href('suppliers') + '">' + t('nav.suppliers') + '</a><a class="btn btn-ghost" href="' + href('account/billing') + '">' + t('dash.billing') + '</a></div></div></div></div></section>';
  }
  function profile() {
    if (requireLogin()) return '';
    var u = me();
    return pageHead('prof.title', null, [[t('nav.account'), 'account'], [t('prof.title')]]) + '<section class="section" style="padding-top:32px"><div class="wrap acct">' + acctNav('account/profile') + '<div>' + takeFlash() +
      '<form class="panel" data-form="profile" novalidate><div class="form-notice"></div><h2>' + t('prof.details') + '</h2><div class="form-grid">' + fld('first', 'f.first', 'text', u.first, true) + fld('last', 'f.last', 'text', u.last, true) + fld('email', 'f.email', 'email', u.email, true) + fld('org', 'f.org', 'text', u.org, false) + fld('job', 'f.job', 'text', u.job, false) + sel('country', 'f.country', COUNTRIES, u.country, false) + '</div>' +
      '<h2 style="margin-top:10px">' + t('prof.prefs') + '</h2>' + sel('lang', 'f.prefLang', I18N.langs.map(function (l) { return [l, I18N.meta[l].label]; }), u.lang, true) + '<p class="small muted">' + t('prof.langNote') + '</p><button class="btn btn-primary">' + t('f.save') + '</button></form>' +
      '<form class="panel" data-form="password" novalidate><div class="form-notice"></div><h2>' + t('prof.password') + '</h2>' + fld('current', 'f.currentPassword', 'password', '', true) + '<div class="form-grid">' + fld('password', 'f.newPassword', 'password', '', true) + fld('password2', 'f.password2', 'password', '', true) + '</div><button class="btn btn-dark">' + t('prof.password') + '</button></form></div></div></section>';
  }
  function billing() {
    if (requireLogin()) return '';
    var u = me(), s = Store.subFor(u.id), st = subStatus(s);
    var txns = Store.get('txns', []).filter(function (x) { return x.user === u.id; });
    var badge = st[0] === 'active' ? 'b-ok' : st[0] === 'cancelled' ? 'b-soon' : st[0] === 'free' ? 'b-sector' : 'b-err';
    return pageHead('bill.title', null, [[t('nav.account'), 'account'], [t('bill.title')]]) + '<section class="section" style="padding-top:32px"><div class="wrap acct">' + acctNav('account/billing') + '<div>' + takeFlash() +
      '<div class="panel"><h2>' + t('bill.current') + '</h2><dl class="kv" style="margin-bottom:18px"><dt>' + t('co.plan') + '</dt><dd>' + esc(s ? planName(s.plan) : L(plan('free').name)) + '</dd><dt>' + t('dash.status') + '</dt><dd><span class="badge ' + badge + '">' + t(st[1]) + '</span></dd>' +
      (s ? '<dt>' + t('bill.started') + '</dt><dd>' + fdate(s.start) + '</dd>' + (s.renews ? '<dt>' + t('dash.renews') + '</dt><dd>' + fdate(s.renews) + '</dd>' : '') + (s.expires ? '<dt>' + t(s.status === 'expired' ? 'dash.expired' : 'dash.expires') + '</dt><dd>' + fdate(s.expires) + '</dd>' : '') + (s.gatewayRef ? '<dt>Gateway token</dt><dd><span class="code">' + s.gatewayRef + '</span></dd>' : '') : '') + '</dl>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' + (s && s.status === 'active' ? '<button class="btn btn-ghost" data-act="cancel-sub" style="border-color:var(--err);color:var(--err)">' + t('bill.cancel') + '</button>' : '') + '<a class="btn btn-dark" href="' + href('membership') + '">' + t(s && (s.status === 'expired' || s.status === 'pending') ? 'dash.renewCta' : 'bill.change') + '</a></div></div>' +
      '<div class="panel"><h2>' + t('bill.history') + '</h2>' + (txns.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>' + t('list.date') + '</th><th>' + t('bill.ref') + '</th><th>' + t('co.plan') + '</th><th>' + t('bill.type') + '</th><th>' + t('bill.amount') + '</th><th>' + t('list.status') + '</th></tr></thead><tbody>' +
      txns.map(function (x) { return '<tr><td>' + fdate(x.date) + '</td><td><span class="code">' + x.id + '</span></td><td>' + esc(planName(x.plan)) + '</td><td>' + t('tx.' + x.type) + '</td><td>' + I18N.money(x.amount, state.lang) + '</td><td><span class="badge ' + (x.status === 'complete' ? 'b-ok' : x.status === 'refunded' ? 'b-sector' : 'b-err') + '">' + t('tx.' + x.status) + '</span></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">' + t('bill.noTxn') + '</p>') + '</div></div></div></section>';
  }

  /* ---------------- search / contact / guide ---------------- */
  function search() {
    var q = state.q.q || '', type = state.q.type || '', sector = state.q.sector || '';
    var defs = [['intel', 'nav.intelligence', intelCard], ['opp', 'nav.opportunities', oppCard], ['supplier', 'nav.suppliers', supCard], ['news', 'nav.news', newsCard], ['webinar', 'nav.webinars', webCard]];
    var res = [];
    if (q) defs.forEach(function (d) { if (type && type !== d[0]) return; Repo.all(d[0]).forEach(function (x) { if (textOf(x).indexOf(q.toLowerCase()) >= 0 && (!sector || x.sector === sector)) res.push([d, x]); }); });
    var counts = {}; if (q) defs.forEach(function (d) { counts[d[0]] = Repo.all(d[0]).filter(function (x) { return textOf(x).indexOf(q.toLowerCase()) >= 0 && (!sector || x.sector === sector); }).length; });
    return pageHead('search.title', null, [[t('nav.search')]]) + '<section class="section" style="padding-top:32px"><div class="wrap"><form class="hero-search" data-form="search" role="search" style="max-width:none;box-shadow:var(--shadow);margin-bottom:20px"><input name="q" type="search" value="' + esc(q) + '" placeholder="' + t('home.search.placeholder') + '" aria-label="' + t('nav.search') + '"><select name="sector" style="width:auto;border:0;border-left:1px solid var(--line);border-radius:0" aria-label="' + t('list.sector') + '"><option value="">' + t('list.sector') + ': ' + t('list.any') + '</option>' + options('sector').map(function (o) { return '<option value="' + o[0] + '"' + (sector === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select><input type="hidden" name="type" value="' + esc(type) + '"><button class="btn btn-primary">' + ICON.search + '<span>' + t('nav.search') + '</span></button></form>' +
      (q ? '<h2 style="font-size:1.4rem">' + t('search.for', { q: esc(q) }) + '</h2><div class="tabs" style="margin-bottom:20px;flex-wrap:wrap"><a href="' + href('search', { q: q, sector: sector }) + '" class="' + (!type ? 'on' : '') + '">' + t('search.all') + '</a>' + defs.map(function (d) { return '<a href="' + href('search', { q: q, type: d[0], sector: sector }) + '" class="' + (type === d[0] ? 'on' : '') + '">' + t(d[1]) + ' (' + counts[d[0]] + ')</a>'; }).join('') + '</div>' +
        (res.length ? '<div class="grid g2">' + res.map(function (r) { return r[0][2](r[1]); }).join('') + '</div>' : '<div class="empty">' + t('list.none') + '</div>') : '<div class="empty">' + t('search.empty') + '</div>') + '</div></section>';
  }
  function contact() {
    var u = me();
    return pageHead('contact.title', 'contact.intro', [[t('nav.contact')]]) + '<section class="section"><div class="wrap grid g2" style="grid-template-columns:1.4fr 1fr;align-items:start"><form class="auth wide" style="margin:0;max-width:none" data-form="contact" novalidate><div class="form-notice"></div><div id="contact-out"></div><div class="form-grid">' +
      fld('name', 'f.name', 'text', u ? u.first + ' ' + u.last : '', true) + fld('email', 'f.email', 'email', u ? u.email : '', true) + fld('org', 'f.org', 'text', u ? u.org : '', false) + fld('phone', 'f.phone', 'tel', '', false) +
      '<div class="full">' + sel('subject', 'f.subject', [['membership', t('contact.subj.membership')], ['listing', t('contact.subj.listing')], ['partnership', t('contact.subj.partnership')], ['other', t('contact.subj.other')]], '', true) +
      '<div class="field" data-f="message"><label for="i-message">' + t('f.message') + ' <span class="req">*</span></label><textarea id="i-message" name="message" rows="5" required></textarea><div class="field-err" role="alert"></div></div>' +
      '<div class="field" data-f="consent"><label class="check"><input type="checkbox" name="consent"> <span>' + t('f.consent') + ' <span class="req">*</span></span></label><div class="field-err" role="alert"></div></div><button class="btn btn-primary">' + t('f.send') + '</button></div></div></form>' +
      '<aside><div class="side-box"><h3>' + t('contact.details') + '</h3><dl class="kv"><dt>Email</dt><dd>info@oilskill-demo.test</dd><dt>Tel.</dt><dd>+258 00 000 0000</dd><dt>' + t('d.location') + '</dt><dd>Maputo, Mozambique</dd></dl><p class="small muted" style="margin-top:12px"><span class="badge b-sample">' + t('badge.sample') + '</span> Contact details to be confirmed by OilSkill.</p></div><div style="border-radius:16px;overflow:hidden;aspect-ratio:4/3;position:relative">' + img('pemba') + '</div></aside></div></section>';
  }
  function guide() {
    var rows = [
      ['Navigation, page templates, responsive layouts', 'working', 'All SOW pages; test at 360–1440px'],
      ['Search & filters (all modules, combinable, shareable URLs)', 'working', 'Keyword, category, sector, location, date, status, content type'],
      ['EN / PT / FR switching: navigation, content, forms, validation, system messages, emails', 'working', 'PT/FR text is machine-assisted, pending professional review'],
      ['Registration, login, forgot/reset password, roles', 'working', 'Stored in this browser only (no server)'],
      ['Restricted premium content by membership level', 'working', 'Visitor / Free / Professional / Corporate / Expired'],
      ['Member dashboard, profile, subscription & billing', 'working', ''],
      ['Checkout → payment gateway → activation', 'simulated', 'Stand-in for PayFast hosted page; outcomes: approved / declined / cancelled'],
      ['Renewal, cancellation, expiry', 'simulated', 'Cancel from account; renew/expire via Admin → Subscriptions'],
      ['Data sync: parsing, field mapping, dedupe, update detection, validation, error log, review queue', 'working', 'Runs in the browser on bundled source snapshots'],
      ['Data sync: live fetch from external sites on daily cron', 'simulated', 'Production: server-side WordPress plugin + server cron'],
      ['Homepage editor: hero, image, headings, project cards, featured items, section order/visibility, per language, live preview', 'working', 'Admin → Pages → Home'],
      ['Webinar registration form + admin list + CSV export', 'working', ''],
      ['Contact form + admin enquiries', 'working', 'Email delivery shown in Admin → Mail Log'],
      ['Email sending', 'simulated', 'Emails are logged (translated) instead of sent'],
      ['Newsletter, file downloads, map embed, social share', 'simulated', ''],
      ['Supplier, opportunity, intelligence, news, webinar records', 'sample', 'Fictional organisations, labelled SAMPLE'],
      ['Photography', 'sample', 'Illustrated placeholders: licensed Mozambican project photos to be supplied (see Image credits)']
    ];
    var lab = { working: ['b-ok', t('badge.working')], simulated: ['b-sim', t('badge.simulated')], sample: ['b-sample', t('badge.sample')] };
    var accts = [['pro@oilskill-demo.test', 'Professional, active (monthly)'], ['free@oilskill-demo.test', 'Registered (free)'], ['cancelled@oilskill-demo.test', 'Cancelled, access until period end'], ['expired@oilskill-demo.test', 'Expired'], ['corporate@oilskill-demo.test', 'Corporate, active'], ['failed@oilskill-demo.test', 'Payment failed / pending']];
    return pageHead('demo.guide', null, [[t('demo.guide')]], '<p>OilSkill Online Intelligence & Membership Platform · prototype for evaluation · WPWeb Infotech</p>') + '<section class="section" style="padding-top:32px"><div class="wrap" style="max-width:1000px">' +
      '<div class="panel"><h2>1. Test accounts</h2><p class="muted">All member accounts use the password <span class="code">Member@2026</span>. Or register a new account yourself.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Email</th><th>State</th><th></th></tr></thead><tbody>' + accts.map(function (a) { return '<tr><td><span class="code">' + a[0] + '</span></td><td>' + a[1] + '</td><td><button class="btn btn-ghost btn-sm" data-act="quick-login" data-email="' + a[0] + '">Log in as</button></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<p style="margin-top:14px"><b>WordPress Admin (demo):</b> <a href="admin.html">admin.html</a>, <span class="code">admin@oilskill-demo.test</span> / <span class="code">Admin@2026</span> (or Editor: <span class="code">editor@oilskill-demo.test</span> / <span class="code">Editor@2026</span>)</p></div>' +
      '<div class="panel"><h2>2. Suggested 10-minute walkthrough</h2><ol style="margin:0;padding-left:20px;line-height:1.9"><li>Home → switch <b>EN / PT / FR</b> in the header; open any page and switch again (same page, translated).</li><li><a href="' + href('opps') + '">Opportunities</a> → combine filters (sector + location + status) → open a detail page.</li><li>Open a premium report as a visitor (locked) → <a href="' + href('register', { plan: 'pro_monthly' }) + '">register with Professional</a> → checkout → choose <i>declined</i>, then retry with <i>approved</i> → membership active → report unlocked.</li><li><a href="' + href('account/billing') + '">My Subscription</a> → cancel → access kept until period end.</li><li>Submit the registration form empty in PT or FR to see translated validation messages.</li><li><a href="admin.html#/sync">Admin → Data Sync</a> → Run now on each source → review queue → approve (with translation) → item appears on the site with source attribution → run again (duplicates skipped) → switch Test Feed to v2 (update detected) and “broken” (error logged + email).</li><li>Admin → Subscriptions → renew or expire a member; log in as that member to see the effect.</li><li><a href="admin.html#/pages/home">Admin → Pages → Home</a> → change the hero heading in English and Portuguese, hide or reorder a section → Update → view the homepage in each language.</li></ol></div>' +
      '<div class="panel"><h2>3. Working vs simulated vs sample</h2><div class="legend" style="margin-bottom:12px"><span class="badge b-ok">' + t('badge.working') + '</span> genuinely functions in the prototype <span class="badge b-sim">' + t('badge.simulated') + '</span> demonstrates the flow; integration completed in production <span class="badge b-sample">' + t('badge.sample') + '</span> placeholder data or imagery</div><div class="tbl-wrap"><table class="tbl matrix"><thead><tr><th>Function</th><th>Status</th><th>Notes</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td><span class="badge ' + lab[r[1]][0] + '">' + lab[r[1]][1] + '</span></td><td class="small muted">' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="panel"><h2>4. Known limitations (prototype)</h2><ul style="margin:0;padding-left:20px;line-height:1.8"><li>Data is stored in your browser (localStorage). Other evaluators will not see your changes. Use “Reset demo data” to start again.</li><li>Payment gateway, email delivery and external source fetching are simulated (see table).</li><li>Third-party limitations in production: PayFast hosted page is English only; Zoom/Teams pages follow their own language settings; imported source content stays in its original language until translated.</li><li>Africa Intelligence and Energy Intelligence are subscription services: syncing them requires a licensed API/feed and written republication permission from the provider.</li></ul></div>' +
      '<div class="panel"><h2>5. From prototype to production</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Prototype element</th><th>Production implementation (SOW)</th></tr></thead><tbody>' +
      [['Hash routes and templates', 'WordPress theme templates per CPT (Milestones 1–2)'], ['data.js records + taxonomies', 'Custom post types + ACF Pro fields + taxonomies'], ['Language dictionaries', 'WPML (content, menus, taxonomies, ACF, String Translation, emails)'], ['Membership logic & gating', 'MemberPress levels, rules and member pages'], ['Simulated PayFast page', 'PayFast (or approved alternative) with recurring billing + ITN validation'], ['Browser sync engine', 'Custom WordPress plugin: server-side fetch, WP-Cron + server cron, same mapping/dedupe/review logic'], ['Admin mock (admin.html)', 'Native WordPress admin with the plugins above'], ['Illustrated image slots', 'Licensed photography from OilSkill and project operators, WebP/AVIF, credited']].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="panel"><h2>6. Reset</h2><p class="muted">Restore all sample data, accounts and settings.</p><button class="btn btn-dark" data-act="reset">Reset demo data</button></div></div></section>';
  }

  /* ---------------- router ---------------- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var qs = ''; var qi = h.indexOf('?'); if (qi >= 0) { qs = h.slice(qi + 1); h = h.slice(0, qi); }
    var parts = h.split('/').filter(Boolean);
    var lang = I18N.langs.indexOf(parts[0]) >= 0 ? parts.shift() : null;
    var q = {}; qs.split('&').filter(Boolean).forEach(function (p) { var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); });
    return { lang: lang, route: parts[0] || 'home', id: parts.slice(1).join('/') || null, q: q };
  }
  function render(opts) {
    opts = opts || {};
    var p = parse();
    if (!p.lang) { var saved = Store.get('lang') || 'en'; location.replace('#/' + saved + '/' + (p.route === 'home' ? '' : p.route + (p.id ? '/' + p.id : ''))); return; }
    state.lang = I18N.lang = p.lang; state.route = p.route; state.id = p.id; state.q = p.q;
    if (Store.get('lang') !== p.lang) Store.set('lang', p.lang);
    document.documentElement.lang = I18N.meta[p.lang].locale;
    document.body.classList.remove('gw-mode');
    document.querySelectorAll('.nav-scrim, .modal-bg').forEach(function (x) { x.remove(); });
    var r = p.route, id = p.id, html;
    if (r === 'home') html = home();
    else if (LISTS[r] && !id) html = listView(r);
    else if (r === 'intel') html = intelDetail(id);
    else if (r === 'opps') html = oppDetail(id);
    else if (r === 'suppliers') html = supDetail(id);
    else if (r === 'news') html = newsDetail(id);
    else if (r === 'webinars') html = webDetail(id);
    else if (r === 'about') html = about();
    else if (r === 'membership') html = membership();
    else if (r === 'register') html = register();
    else if (r === 'login') html = login();
    else if (r === 'forgot') html = forgot();
    else if (r === 'reset') html = reset();
    else if (r === 'checkout') html = checkout(id);
    else if (r === 'gateway') { app.innerHTML = gateway(id); document.title = 'PayFast (sandbox, simulated)'; window.scrollTo(0, 0); return; }
    else if (r === 'result') html = result(id);
    else if (r === 'account') html = id === 'profile' ? profile() : id === 'billing' ? billing() : dashboard();
    else if (r === 'search') html = search();
    else if (r === 'contact') html = contact();
    else if (r === 'privacy' || r === 'terms') html = legal(r);
    else if (r === 'credits') html = credits();
    else if (r === 'guide') html = guide();
    else html = notFound();
    if (html === '') return;
    app.innerHTML = header() + '<main id="main">' + html + '</main>' + footer();
    var h1 = app.querySelector('h1');
    document.title = (h1 && r !== 'home' ? h1.textContent + ' | ' : '') + 'OilSkill · ' + t('site.tagline');
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { render(); });
  /* Another tab changed shared data (e.g. admin approved an import): refresh this tab.
     UI-only keys are ignored, otherwise two tabs in different languages would keep
     re-rendering each other and swallow clicks. Never re-render while the user is typing. */
  var UI_KEYS = ['lang', 'flash', 'cookie', 'ribbonClosed', 'langSuggestClosed', 'adminFlash', 'adminSession', 'resetToken'];
  var syncTimer;
  window.addEventListener('storage', function (e) {
    var PFX = 'oilskill_demo_v1_';
    if (!e.key || e.key.indexOf(PFX) !== 0 || UI_KEYS.indexOf(e.key.slice(PFX.length)) >= 0) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      var a = document.activeElement;
      if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
      render({ keepScroll: true });
    }, 400);
  });

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'menu') { document.getElementById('mnav').classList.add('open'); var s = document.createElement('div'); s.className = 'nav-scrim'; s.setAttribute('data-act', 'menu-close'); document.body.appendChild(s); a.setAttribute('aria-expanded', 'true'); }
    else if (act === 'menu-close') { e.preventDefault(); var m = document.getElementById('mnav'); if (m) m.classList.remove('open'); document.querySelectorAll('.nav-scrim').forEach(function (x) { x.remove(); }); }
    else if (act === 'close-ribbon') { Store.set('ribbonClosed', true); a.closest('.ribbon').remove(); }
    else if (act === 'close-suggest') { Store.set('langSuggestClosed', true); a.closest('.lang-suggest').remove(); }
    else if (act === 'cookie') { Store.set('cookie', a.getAttribute('data-v')); a.closest('.cookie').remove(); }
    else if (act === 'toggle-filters') { document.getElementById('filters').classList.toggle('open'); }
    else if (act === 'unfilter') { var q = Object.assign({}, state.q); delete q[a.getAttribute('data-k')]; delete q.page; go(state.route, q); }
    else if (act === 'logout') { e.preventDefault(); Store.set('session', null); flash(t('ok.loggedOut')); go('login'); }
    else if (act === 'share') { e.preventDefault(); toast(a.getAttribute('data-net') + ': ' + t('badge.simulated')); }
    else if (act === 'download') { e.preventDefault(); toast(t('badge.simulated') + ': PDF'); }
    else if (act === 'contact-supplier') { toast(t('badge.simulated') + ': ' + t('d.contactSupplier')); }
    else if (act === 'quick-login') { var u = Store.userByEmail(a.getAttribute('data-email')); Store.set('session', u.id); flash(t('ok.loggedIn')); go('account'); }
    else if (act === 'reset') { if (confirm('Reset all demo data in this browser?')) { Store.reset(); toast('Demo data reset'); render(); } }
    else if (act === 'gw-cancel') { e.preventDefault(); var pid = a.getAttribute('data-plan'), u2 = me(); var id = 'PF-SBX-' + Math.floor(100000 + Math.random() * 899999); Store.push('txns', { id: id, user: u2.id, plan: pid, amount: plan(pid).price, status: 'cancelled', type: 'initial', date: Store.now(), note: 'Buyer cancelled on gateway' }); go('result/cancelled', { plan: pid }); }
    else if (act === 'cancel-sub') {
      var u3 = me(), s3 = Store.subFor(u3.id);
      var bg = document.createElement('div'); bg.className = 'modal-bg';
      bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><h2 id="mt" style="font-size:1.5rem">' + t('bill.cancelConfirmTitle') + '</h2><p class="muted">' + t('bill.cancelConfirm', { d: fdate(s3.renews) }) + '</p><div class="acts"><button class="btn btn-ghost" data-act="modal-close">' + t('bill.keep') + '</button><button class="btn btn-primary" style="background:var(--err)" data-act="confirm-cancel">' + t('bill.confirmCancel') + '</button></div></div>';
      document.body.appendChild(bg); bg.querySelector('[data-act="modal-close"]').focus();
    }
    else if (act === 'modal-close') { a.closest('.modal-bg').remove(); }
    else if (act === 'confirm-cancel') {
      var u4 = me(), s4 = Store.subFor(u4.id);
      s4.status = 'cancelled'; s4.expires = s4.renews; s4.renews = null; s4.cancelledAt = Store.now(); Store.saveSub(s4);
      sendMail(u4, 'mail.cancel', { d: I18N.date(s4.expires, u4.lang) });
      a.closest('.modal-bg').remove(); flash(t('bill.cancelled')); render();
    }
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.matches('[data-act="sort"]')) { go(state.route, Object.assign({}, state.q, { sort: el.value, page: '' })); }
    else if (el.form && el.form.id === 'filters' && el.tagName === 'SELECT' && window.innerWidth > 980) { el.form.requestSubmit(); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'i-password' && document.getElementById('meter')) {
      var v = e.target.value, sc = (v.length >= 8) + /\d/.test(v) + /[A-Z]/.test(v) + /[^A-Za-z0-9]/.test(v) + (v.length >= 12);
      var m = document.getElementById('meter'), l = document.getElementById('meter-l');
      m.style.width = (sc * 20) + '%'; m.style.background = sc <= 2 ? 'var(--err)' : sc <= 3 ? 'var(--amber)' : 'var(--ok)';
      l.textContent = t('f.strength') + ': ' + t(sc <= 2 ? 'f.weak' : sc <= 3 ? 'f.medium' : 'f.strong');
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target, kind = f.getAttribute('data-form') || (f.id === 'filters' ? 'filters' : null);
    if (!kind) return;
    e.preventDefault();
    var v = function (n) { var el = f.elements[n]; return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : ''; };
    if (kind === 'filters') {
      var q = {}; Array.prototype.forEach.call(f.elements, function (el) { if (el.name && el.value) q[el.name] = el.value.trim(); });
      if (state.q.sort) q.sort = state.q.sort; go(state.route, q); return;
    }
    if (kind === 'hero-search' || kind === 'search') { go('search', { q: v('q'), sector: v('sector'), type: v('type') }); return; }
    if (kind === 'newsletter') { f.innerHTML = '<div class="notice notice-ok" style="margin:0">' + t('home.newsletter.ok') + '</div>'; return; }
    clearErr(f);
    var bad = false;
    function need(n, key) { if (!v(n)) { setErr(f, n, key || 'err.required'); bad = true; return false; } return true; }
    if (kind === 'register') {
      if (v('website')) return; /* honeypot */
      need('first'); need('last'); need('org'); need('country'); need('lang'); need('plan');
      if (need('email') && !EMAIL_RE.test(v('email'))) { setErr(f, 'email', 'err.email'); bad = true; }
      else if (v('email') && Store.userByEmail(v('email'))) { setErr(f, 'email', 'err.emailExists'); bad = true; }
      if (need('password') && !strong(v('password'))) { setErr(f, 'password', 'err.passwordShort'); bad = true; }
      if (need('password2') && v('password') !== v('password2')) { setErr(f, 'password2', 'err.passwordMatch'); bad = true; }
      if (!v('terms')) { setErr(f, 'terms', 'err.terms'); bad = true; }
      if (bad) return formErr(f);
      var u = { id: Store.uid('u'), role: 'subscriber', first: v('first'), last: v('last'), email: v('email').toLowerCase(), password: v('password'), org: v('org'), job: v('job'), country: v('country'), sector: v('sector'), lang: v('lang'), marketing: v('marketing'), created: Store.now() };
      Store.saveUser(u); Store.set('session', u.id); sendMail(u, 'mail.welcome', { name: u.first });
      flash(t('ok.registered'));
      if (v('plan') !== 'free') go('checkout/' + v('plan')); else go('account');
    }
    else if (kind === 'login') {
      need('email'); need('password'); if (bad) return formErr(f);
      var u2 = Store.userByEmail(v('email'));
      if (!u2 || u2.password !== v('password')) { var n = f.querySelector('.form-notice'); n.innerHTML = '<div class="notice notice-err" role="alert">' + t('err.login') + '</div>'; setErr(f, 'password', 'err.login'); return; }
      Store.set('session', u2.id); flash(t('ok.loggedIn')); go(state.q.redirect || 'account');
    }
    else if (kind === 'forgot') {
      if (need('email') && !EMAIL_RE.test(v('email'))) { setErr(f, 'email', 'err.email'); bad = true; }
      if (bad) return formErr(f);
      var u3 = Store.userByEmail(v('email')), out = '<div class="notice notice-ok">' + t('forgot.sent') + '</div>';
      if (u3) { var tok = Math.random().toString(36).slice(2, 12); Store.set('resetToken', { u: u3.id, tok: tok }); sendMail(u3, 'mail.reset', {}); out += '<p><a class="btn btn-dark btn-sm" href="' + href('reset', { token: tok }) + '">' + t('forgot.openLink') + '</a></p>'; }
      document.getElementById('forgot-out').innerHTML = out;
    }
    else if (kind === 'reset') {
      var rt = Store.get('resetToken');
      if (!rt || rt.tok !== state.q.token) { f.querySelector('.form-notice').innerHTML = '<div class="notice notice-err">Invalid or expired link.</div>'; return; }
      if (need('password') && !strong(v('password'))) { setErr(f, 'password', 'err.passwordShort'); bad = true; }
      if (need('password2') && v('password') !== v('password2')) { setErr(f, 'password2', 'err.passwordMatch'); bad = true; }
      if (bad) return formErr(f);
      var u4 = Store.user(rt.u); u4.password = v('password'); Store.saveUser(u4); Store.set('resetToken', null);
      flash(t('reset.done')); go('login');
    }
    else if (kind === 'checkout') {
      if (!v('agree')) { setErr(f, 'agree', 'err.terms'); return formErr(f); }
      go('gateway/' + f.getAttribute('data-plan'));
    }
    else if (kind === 'gateway') {
      var pid = f.getAttribute('data-plan'), p = plan(pid), u5 = me(), outcome = f.elements.o.value;
      var ref = 'PF-SBX-' + Math.floor(100000 + Math.random() * 899999);
      var btn = f.querySelector('.gw-btn'); btn.disabled = true; btn.textContent = 'Processing…';
      setTimeout(function () {
        var s = Store.subFor(u5.id);
        if (outcome === 'success') {
          var renews = Store.addDays(new Date(), p.cycle === 'month' ? 30 : 365);
          if (!s) s = { id: Store.uid('s'), user: u5.id };
          Object.assign(s, { plan: pid, status: 'active', start: Store.now(), renews: renews, expires: null, gatewayRef: 'PF-SBX-TOKEN-' + ref.slice(-5) });
          Store.saveSub(s);
          Store.push('txns', { id: ref, user: u5.id, plan: pid, amount: p.price, status: 'complete', type: 'initial', date: Store.now() });
          sendMail(u5, 'mail.receipt', { ref: ref, amount: I18N.money(p.price, u5.lang), plan: L(p.name, u5.lang) });
          go('result/success', { ref: ref, plan: pid });
        } else {
          if (!s) { s = { id: Store.uid('s'), user: u5.id, plan: pid, status: 'pending', start: Store.now(), renews: null, expires: null, gatewayRef: null }; Store.saveSub(s); }
          else if (s.status !== 'active' && s.status !== 'cancelled') { s.status = 'pending'; s.plan = pid; Store.saveSub(s); }
          Store.push('txns', { id: ref, user: u5.id, plan: pid, amount: p.price, status: 'failed', type: 'initial', date: Store.now(), note: 'Card declined (sandbox)' });
          sendMail(u5, 'mail.failed', { plan: L(p.name, u5.lang) });
          go('result/failed', { ref: ref, plan: pid });
        }
      }, 1100);
    }
    else if (kind === 'profile') {
      need('first'); need('last'); need('lang');
      if (need('email') && !EMAIL_RE.test(v('email'))) { setErr(f, 'email', 'err.email'); bad = true; }
      if (bad) return formErr(f);
      var u6 = me(); Object.assign(u6, { first: v('first'), last: v('last'), email: v('email'), org: v('org'), job: v('job'), country: v('country'), lang: v('lang') }); Store.saveUser(u6);
      flash(I18N.t('ok.saved', null, u6.lang)); if (u6.lang !== state.lang) location.hash = '#/' + u6.lang + '/account/profile'; else render();
    }
    else if (kind === 'password') {
      var u7 = me();
      if (need('current') && v('current') !== u7.password) { setErr(f, 'current', 'err.currentPassword'); bad = true; }
      if (need('password') && !strong(v('password'))) { setErr(f, 'password', 'err.passwordShort'); bad = true; }
      if (need('password2') && v('password') !== v('password2')) { setErr(f, 'password2', 'err.passwordMatch'); bad = true; }
      if (bad) return formErr(f);
      u7.password = v('password'); Store.saveUser(u7); flash(t('ok.saved')); render();
    }
    else if (kind === 'webreg') {
      need('name'); if (need('email') && !EMAIL_RE.test(v('email'))) { setErr(f, 'email', 'err.email'); bad = true; }
      if (bad) return formErr(f);
      var wid = f.getAttribute('data-id'), w = Repo.get('webinar', wid);
      if (Store.get('regs', []).some(function (r) { return r.webinar === wid && r.email.toLowerCase() === v('email').toLowerCase(); })) { f.innerHTML = '<div class="notice notice-info">' + t('ok.alreadyReg') + '</div>'; return; }
      Store.push('regs', { id: Store.uid('r'), webinar: wid, name: v('name'), email: v('email'), org: v('org'), lang: state.lang, date: Store.now() });
      Store.mail(v('email'), 'mail.webinar', state.lang, { title: L(w.title), d: I18N.dateTime(w.start, state.lang) });
      f.innerHTML = '<div class="notice notice-ok">' + t('ok.webinarReg') + '</div>';
    }
    else if (kind === 'contact') {
      need('name'); need('subject'); need('message');
      if (need('email') && !EMAIL_RE.test(v('email'))) { setErr(f, 'email', 'err.email'); bad = true; }
      if (!v('consent')) { setErr(f, 'consent', 'err.required'); bad = true; }
      if (bad) return formErr(f);
      Store.push('contacts', { id: Store.uid('c'), name: v('name'), email: v('email'), org: v('org'), phone: v('phone'), subject: v('subject'), message: v('message'), lang: state.lang, date: Store.now() });
      Store.mail('info@oilskill-demo.test', 'mail.contact', 'en', { subject: v('subject') + ' from ' + v('name') });
      f.innerHTML = '<div class="notice notice-ok" role="status">' + t('ok.contact') + '</div>';
    }
  });

  render();
})();
