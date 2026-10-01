/* OilSkill prototype – WordPress admin look-alike.
   Shares state with the front-end (Store/Repo), so every action here is visible on the site.
   Production equivalent: native WordPress admin + ACF Pro + MemberPress + WPML + custom sync plugin. */
(function () {
  var L = function (o, l) { return I18N.L(o, l || 'en'); }, D = DATA, TAX = D.TAX;
  var root = document.getElementById('admin');
  var R = { route: 'dashboard', parts: [], q: {} };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fdt(iso) { if (!iso) return '–'; var d = new Date(iso), z = { timeZone: 'Africa/Maputo' }; return d.toLocaleDateString('en-GB', Object.assign({ day: '2-digit', month: 'short', year: 'numeric' }, z)) + ' ' + d.toLocaleTimeString('en-GB', Object.assign({ hour: '2-digit', minute: '2-digit' }, z)) + ' CAT'; }
  function fd(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'; }
  function tax(g, k) { return TAX[g] && TAX[g][k] ? L(TAX[g][k]) : (k || '–'); }
  function money(n) { return 'R ' + Number(n).toLocaleString('en-ZA'); }
  function toast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200); }
  function me() { var id = Store.get('adminSession'); return id ? Store.user(id) : null; }
  function isAdmin() { var u = me(); return u && u.role === 'administrator'; }
  function plan(id) { return D.PLANS.filter(function (p) { return p.id === id; })[0]; }
  function planName(id) { var p = plan(id); return p ? L(p.name) + (p.cycle ? ' (' + (p.cycle === 'month' ? 'Monthly' : 'Annual') + ')' : '') : id; }
  function siteUrl(path) { return 'index.html#/en/' + (path || ''); }
  function opts(group, val, any) { return (any ? '<option value="">' + any + '</option>' : '') + Object.keys(TAX[group]).map(function (k) { return '<option value="' + k + '"' + (k === val ? ' selected' : '') + '>' + esc(L(TAX[group][k])) + '</option>'; }).join(''); }

  var TYPES = {
    intel: { label: 'Industry Intelligence', single: 'Intelligence item', icon: '📊', site: 'intel', cat: 'intelCat' },
    opp: { label: 'Business Opportunities', single: 'Opportunity', icon: '💼', site: 'opps', cat: 'oppType' },
    supplier: { label: 'Suppliers', single: 'Supplier', icon: '🏭', site: 'suppliers', cat: 'service' },
    news: { label: 'News', single: 'News post', icon: '📰', site: 'news', cat: 'newsCat' },
    webinar: { label: 'Webinars', single: 'Webinar', icon: '🎥', site: 'webinars', cat: 'webCat' }
  };
  function titleOf(x, lang) { return x.name || L(x.title, lang); }

  /* ---------------- chrome ---------------- */
  function menu() {
    var q = Store.get('queue', []).filter(function (x) { return x.status === 'pending'; }).length;
    var items = [
      ['dashboard', '🏠', 'Dashboard'], 'sep',
      ['list/news', '📌', 'Posts (News)'], ['list/intel', '📊', 'Intelligence'], ['list/opp', '💼', 'Opportunities'], ['list/supplier', '🏭', 'Suppliers'], ['list/webinar', '🎥', 'Webinars', [['list/webinar', 'All Webinars'], ['regs', 'Registrations']]], ['media', '🖼', 'Media'], ['pages', '📄', 'Pages'], ['enquiries', '✉', 'Enquiries'], 'sep',
      ['sync', '⟳', 'Data Sync', [['sync', 'Sources'], ['sync/queue', 'Review Queue'], ['sync/logs', 'Logs']], q],
      ['members', '👥', 'MemberPress', [['members', 'Members'], ['plans', 'Memberships'], ['subs', 'Subscriptions'], ['txns', 'Transactions'], ['payments', 'Settings › Payments']]],
      ['wpml', '🌐', 'WPML', [['wpml', 'Languages'], ['wpml/translations', 'Translation Management'], ['strings', 'String Translation']]], 'sep',
      ['users', '👤', 'Users'], ['mail', '📨', 'Mail Log'], ['settings', '⚙', 'Settings']
    ];
    var cur = R.parts.join('/');
    return '<nav id="menu" aria-label="Admin menu">' + items.map(function (it) {
      if (it === 'sep') return '<div class="sep"></div>';
      var group = it[3], on = cur === it[0] || cur.indexOf(it[0] + '/') === 0 || (group && group.some(function (g) { return cur === g[0] || cur.indexOf(g[0] + '/') === 0; })) || (it[0].indexOf('list/') === 0 && (cur === 'edit/' + it[0].slice(5) || cur.indexOf('edit/' + it[0].slice(5) + '/') === 0 || cur === 'new/' + it[0].slice(5)));
      if ((it[0] === 'users' || it[0] === 'settings' || it[0] === 'payments') && !isAdmin()) return '';
      return '<a href="#/' + it[0] + '" class="' + (on ? 'on' : '') + '" title="' + it[2] + '"><span class="di">' + it[1] + '</span><span class="lbl">' + it[2] + '</span>' + (it[4] ? '<span class="cnt">' + it[4] + '</span>' : '') + '</a>' +
        (group && on ? '<div class="sub">' + group.map(function (g) { return '<a href="#/' + g[0] + '" class="' + (cur === g[0] ? 'on' : '') + '">' + g[1] + '</a>'; }).join('') + '</div>' : '');
    }).join('') + '</nav>';
  }
  function bar() {
    var u = me();
    return '<div id="adminbar"><a class="wp" href="#/dashboard" title="WordPress">W</a><a href="index.html" target="_blank">🏠 OilSkill</a><a href="#/sync/queue">⟳ ' + Store.get('queue', []).filter(function (x) { return x.status === 'pending'; }).length + '</a><a href="#/new/news">＋ New</a><a href="#/pages/home">✎ Edit Home</a><span class="demo">PROTOTYPE · SIMULATED WP ADMIN</span>' +
      '<div class="right"><a href="index.html#/en/guide" target="_blank">Demo guide</a><a href="#" data-a="logout">Howdy, ' + esc(u.first) + ' (' + u.role + ') · Log out</a></div></div>';
  }
  function frame(html) { root.innerHTML = bar() + menu() + '<div id="wpbody"><div class="wrap">' + html + '</div></div>'; window.scrollTo(0, 0); }
  function flashHtml() { var f = Store.get('adminFlash'); if (!f) return ''; Store.set('adminFlash', null); return '<div class="notice notice-' + (f.k || 'success') + '"><p>' + f.m + '</p></div>'; }
  function flash(m, k) { Store.set('adminFlash', { m: m, k: k }); }
  function langIcons(type, x) {
    return I18N.langs.map(function (l) {
      var has = l === 'en' || I18N.hasLang(x.title, l) || (type === 'supplier' && I18N.hasLang(x.overview, l));
      var cls = !has ? 'no' : (x.mt && l !== 'en' ? 'mt' : 'ok');
      return '<a class="lang-ic ' + cls + '" href="#/edit/' + type + '/' + x.id + '?lang=' + l + '" title="' + I18N.meta[l].label + (has ? (cls === 'mt' ? ': machine-translated' : ': translated') : ': add translation') + '">' + (has ? l.toUpperCase() : '+' + l.toUpperCase()) + '</a>';
    }).join('');
  }

  /* ---------------- login ---------------- */
  function loginView(err) {
    root.innerHTML = '<div class="login"><div><div class="logo"><img src="assets/img/logo-full.png" alt="OilSkill Co" style="height:auto;width:240px"></div>' + (err ? '<div class="err"><b>Error:</b> The username or password you entered is incorrect.</div>' : '') +
      '<form data-f="login"><label for="u">Username or Email Address</label><input type="text" id="u" name="u" autocomplete="username" value="admin@oilskill-demo.test"><label for="p">Password</label><input type="password" id="p" name="p" autocomplete="current-password"><label style="display:flex;gap:6px;align-items:center;font-size:13px;margin-bottom:14px"><input type="checkbox" checked> Remember Me</label><button class="button button-primary" style="width:100%;justify-content:center;min-height:36px">Log In</button></form>' +
      '<div class="hint">Prototype admin. Administrator: <code>admin@oilskill-demo.test</code> / <code>Admin@2026</code><br>Editor (content & data reviewer): <code>editor@oilskill-demo.test</code> / <code>Editor@2026</code><br><a href="index.html">← Go to OilSkill</a></div></div></div>';
  }

  /* ---------------- dashboard ---------------- */
  function dashboard() {
    var subs = Store.get('subs', []), txns = Store.get('txns', []), users = Store.users();
    var by = function (s) { return subs.filter(function (x) { return x.status === s; }).length; };
    var rev = txns.filter(function (x) { return x.status === 'complete'; }).reduce(function (a, x) { return a + x.amount; }, 0);
    var pend = Store.get('queue', []).filter(function (x) { return x.status === 'pending'; });
    var logs = Store.get('synclog', []);
    var webs = Repo.all('webinar').filter(function (w) { return new Date(w.start) > new Date(); });
    var regs = Store.get('regs', []);
    var contacts = Store.get('contacts', []);
    return '<h1>Dashboard</h1>' + flashHtml() + '<div class="notice notice-warning"><p><b>Prototype notice:</b> this screen simulates the WordPress admin for evaluation. In production the same functions are delivered by WordPress, ACF Pro, MemberPress, WPML and the custom OilSkill Data Sync plugin. Data is stored in this browser only.</p></div>' +
      '<div class="dash"><div><div class="postbox"><h2 class="hndle">At a Glance</h2><div class="inside glance">' + Object.keys(TYPES).map(function (k) { return '<a href="#/list/' + k + '">' + TYPES[k].icon + ' ' + Repo.all(k).length + ' ' + TYPES[k].label + '</a>'; }).join('') + '<a href="#/members">👥 ' + users.filter(function (u) { return u.role === 'subscriber'; }).length + ' Members</a><a href="#/regs">🎟 ' + regs.length + ' Webinar registrations</a></div></div>' +
      '<div class="postbox"><h2 class="hndle">Memberships <a href="#/subs" class="small">View</a></h2><div class="inside"><dl class="kv"><dt>Active</dt><dd><span class="pill green">' + by('active') + '</span></dd><dt>Cancelled (in period)</dt><dd><span class="pill amber">' + by('cancelled') + '</span></dd><dt>Expired</dt><dd><span class="pill">' + by('expired') + '</span></dd><dt>Payment pending/failed</dt><dd><span class="pill red">' + by('pending') + '</span></dd><dt>Revenue (sandbox)</dt><dd><b>' + money(rev) + '</b></dd></dl></div></div></div>' +
      '<div><div class="postbox"><h2 class="hndle">Data Sync <a href="#/sync">Manage</a></h2><div class="inside">' + (pend.length ? '<div class="notice notice-warning" style="margin-top:0"><p><b>' + pend.length + '</b> imported item(s) awaiting review. <a href="#/sync/queue">Review now →</a></p></div>' : '<p>No items awaiting review.</p>') +
      Sync.sources.map(function (s) { var l = logs.filter(function (x) { return x.source === s.id; })[0]; return '<p style="margin:6px 0"><b>' + esc(s.name.split(':')[0]) + '</b> · ' + (l ? '<span class="pill ' + (l.status === 'success' ? 'green' : l.status === 'warning' ? 'amber' : 'red') + '">' + l.status + '</span> ' + fdt(l.end) : '<span class="pill">never run</span>') + '</p>'; }).join('') + '</div></div>' +
      '<div class="postbox"><h2 class="hndle">Recent transactions <a href="#/txns">View</a></h2><div class="inside">' + txns.slice(0, 5).map(function (x) { var u = Store.user(x.user); return '<p style="margin:4px 0"><code>' + x.id + '</code> ' + esc(u ? u.first + ' ' + u.last : '') + ' · ' + money(x.amount) + ' <span class="pill ' + (x.status === 'complete' ? 'green' : 'red') + '">' + x.status + '</span></p>'; }).join('') + '</div></div></div>' +
      '<div><div class="postbox"><h2 class="hndle">Upcoming webinars</h2><div class="inside">' + webs.map(function (w) { return '<p style="margin:4px 0"><a href="#/edit/webinar/' + w.id + '">' + esc(L(w.title)) + '</a><br><span style="color:#646970">' + fdt(w.start) + ' · ' + regs.filter(function (r) { return r.webinar === w.id; }).length + ' registered</span></p>'; }).join('') + '</div></div>' +
      '<div class="postbox"><h2 class="hndle">Recent enquiries <a href="#/enquiries">View</a></h2><div class="inside">' + (contacts.length ? contacts.slice(0, 4).map(function (c) { return '<p style="margin:4px 0"><b>' + esc(c.name) + '</b> · ' + esc(c.subject) + ' <span class="pill">' + c.lang.toUpperCase() + '</span></p>'; }).join('') : '<p style="color:#646970">No enquiries yet. Submit the Contact form on the site.</p>') + '</div></div>' +
      '<div class="postbox"><h2 class="hndle">Languages</h2><div class="inside">' + I18N.langs.map(function (l) { var tot = 0, ok = 0; Object.keys(TYPES).forEach(function (k) { Repo.all(k).forEach(function (x) { tot++; if (l === 'en' || I18N.hasLang(x.title, l) || I18N.hasLang(x.overview, l)) ok++; }); }); return '<p style="margin:4px 0">' + I18N.meta[l].label + ': <b>' + ok + '/' + tot + '</b> items translated</p>'; }).join('') + '</div></div></div></div>';
  }

  /* ---------------- content list & edit ---------------- */
  function list(type) {
    var cfg = TYPES[type], q = R.q, all = Repo.all(type, true);
    var st = q.status || 'all';
    var counts = { all: all.filter(function (x) { return x.status !== 'trash'; }).length, publish: all.filter(function (x) { return (x.status || 'publish') === 'publish'; }).length, draft: all.filter(function (x) { return x.status === 'draft'; }).length, imported: all.filter(function (x) { return x.imported && x.status !== 'trash'; }).length, trash: all.filter(function (x) { return x.status === 'trash'; }).length };
    var rows = all.filter(function (x) {
      var s = x.status || 'publish';
      if (st === 'all' && s === 'trash') return false;
      if (st === 'publish' && s !== 'publish') return false;
      if (st === 'draft' && s !== 'draft') return false;
      if (st === 'trash' && s !== 'trash') return false;
      if (st === 'imported' && (!x.imported || s === 'trash')) return false;
      if (q.s && titleOf(x).toLowerCase().indexOf(q.s.toLowerCase()) < 0) return false;
      if (q.sector && x.sector !== q.sector) return false;
      return true;
    }).sort(function (a, b) { return new Date(b.date || b.start || 0) - new Date(a.date || a.start || 0); });
    var catField = type === 'supplier' ? function (x) { return (x.services || []).map(function (s) { return tax('service', s); }).join(', '); } : type === 'opp' ? function (x) { return tax('oppType', x.type); } : function (x) { return tax(cfg.cat, x.cat); };
    return '<h1>' + cfg.label + ' <a href="#/new/' + type + '" class="button page-title-action">Add New</a></h1>' + flashHtml() +
      '<ul class="subsubsub">' + [['all', 'All'], ['publish', 'Published'], ['draft', 'Drafts'], ['imported', 'Imported (sync)'], ['trash', 'Trash']].map(function (s, i) { return (i ? '| ' : '') + '<li><a href="#/list/' + type + '?status=' + s[0] + '" class="' + (st === s[0] ? 'current' : '') + '">' + s[1] + ' <span style="color:#646970">(' + counts[s[0]] + ')</span></a></li>'; }).join('') + '</ul>' +
      '<form class="tablenav" data-f="listfilter" data-type="' + type + '"><div class="acts"><select name="sector">' + opts('sector', q.sector, 'All sectors') + '</select><button class="button">Filter</button></div><div class="acts"><input type="search" name="s" value="' + esc(q.s || '') + '" placeholder="Search ' + cfg.label.toLowerCase() + '"><button class="button">Search</button></div></form>' +
      '<table class="wp-list-table"><thead><tr><th class="check-col"><input type="checkbox" aria-label="Select all"></th><th>Title</th><th class="hide-sm">' + (type === 'supplier' ? 'Services' : 'Category / Type') + '</th><th class="hide-sm">Sector</th><th class="hide-sm">Location</th><th>Languages</th><th class="hide-sm">Access / Status</th><th>Date</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (x) {
        var s = x.status || 'publish';
        return '<tr><td><input type="checkbox" aria-label="Select"></td><td><a class="row-title" href="#/edit/' + type + '/' + x.id + '">' + esc(titleOf(x)) + '</a>' + (s === 'draft' ? ' — <b>Draft</b>' : '') + (x.imported ? ' <span class="pill blue">⟳ imported</span>' : '') + (x.sample ? ' <span class="pill purple">sample</span>' : '') +
          '<div class="row-actions"><a href="#/edit/' + type + '/' + x.id + '">Edit</a> | ' + (s === 'trash' ? '<a href="#" data-a="restore" data-t="' + type + '" data-id="' + x.id + '">Restore</a>' : '<span class="trash"><a href="#" data-a="trash" data-t="' + type + '" data-id="' + x.id + '">Trash</a></span> | <a href="' + siteUrl(cfg.site + '/' + x.id) + '" target="_blank">View</a>') + '</div></td>' +
          '<td class="hide-sm">' + esc(catField(x)) + '</td><td class="hide-sm">' + tax('sector', x.sector) + '</td><td class="hide-sm">' + tax('location', x.loc) + '</td><td>' + langIcons(type, x) + '</td>' +
          '<td class="hide-sm">' + (x.premium ? '<span class="pill amber">Premium</span>' : '<span class="pill">Free</span>') + (type === 'opp' && x.close ? ' <span class="pill ' + (new Date(x.close) < new Date() ? 'red' : 'green') + '">closes ' + fd(x.close) + '</span>' : '') + '</td><td>' + (s === 'publish' ? 'Published' : s === 'draft' ? 'Last modified' : 'Trashed') + '<br>' + fd(x.date || x.start || x.modified) + '</td></tr>';
      }).join('') : '<tr><td colspan="8">No items found.</td></tr>') + '</tbody></table><p style="color:#646970;margin-top:10px">Language column: <span class="lang-ic ok">EN</span> translated · <span class="lang-ic mt">PT</span> machine-translated · <span class="lang-ic no">+FR</span> add translation (WPML).</p>';
  }

  function edit(type, id) {
    var cfg = TYPES[type], isNew = !id, x = isNew ? { id: type + '_' + Date.now().toString(36), title: {}, summary: {}, status: 'draft', sector: 'services', loc: 'national', date: Store.now() } : Repo.get(type, id);
    if (!x) return '<h1>Not found</h1>';
    var lang = R.q.lang || 'en';
    var txtField = type === 'supplier' ? 'overview' : type === 'opp' ? 'desc' : 'summary';
    var titleVal = type === 'supplier' ? x.name : ((x.title || {})[lang] || '');
    var acf = [];
    acf.push('<div class="acf-row"><div class="acf-field"><label>Industry sector</label><select name="sector">' + opts('sector', x.sector) + '</select></div><div class="acf-field"><label>Location</label><select name="loc">' + opts('location', x.loc) + '</select></div></div>');
    if (type === 'intel') acf.push('<div class="acf-row"><div class="acf-field"><label>Category</label><select name="cat">' + opts('intelCat', x.cat) + '</select></div><div class="acf-field"><label>Report type</label><select name="type">' + opts('reportType', x.type) + '</select></div></div><div class="acf-field"><label>Attachment (PDF)</label><input type="text" value="' + (x.imported ? '' : 'report-' + x.id + '.pdf') + '" placeholder="Select file from Media Library" readonly><div class="desc">File upload is simulated in the prototype.</div></div>');
    if (type === 'opp') acf.push('<div class="acf-row"><div class="acf-field"><label>Opportunity type</label><select name="type">' + opts('oppType', x.type) + '</select></div><div class="acf-field"><label>Organisation</label><input type="text" name="org" value="' + esc(x.org || '') + '"></div></div><div class="acf-row"><div class="acf-field"><label>Opening date</label><input type="date" name="date" value="' + (x.date || '').slice(0, 10) + '"></div><div class="acf-field"><label>Closing date</label><input type="date" name="close" value="' + (x.close || '').slice(0, 10) + '"><div class="desc">Status (Open / Closing soon / Closed) is calculated automatically from this date.</div></div></div>');
    if (type === 'supplier') acf.push('<div class="acf-field"><label>Services</label>' + Object.keys(TAX.service).map(function (k) { return '<label style="display:inline-flex;gap:4px;font-weight:400;margin:0 12px 4px 0"><input type="checkbox" name="svc" value="' + k + '"' + ((x.services || []).indexOf(k) >= 0 ? ' checked' : '') + '> ' + esc(L(TAX.service[k])) + '</label>'; }).join('') + '</div><div class="acf-row"><div class="acf-field"><label>City / town</label><input type="text" name="city" value="' + esc(x.city || '') + '"></div><div class="acf-field"><label>Certifications (comma-separated)</label><input type="text" name="certs" value="' + esc((x.certs || []).join(', ')) + '"></div></div><div class="acf-row"><div class="acf-field"><label>Year founded</label><input type="number" name="founded" value="' + (x.founded || '') + '"></div><div class="acf-field"><label>Employees</label><input type="text" name="staff" value="' + esc(x.staff || '') + '"></div></div><div class="acf-field"><label><input type="checkbox" name="featured"' + (x.featured ? ' checked' : '') + '> Featured on homepage</label></div>');
    if (type === 'news') acf.push('<div class="acf-field"><label>Category</label><select name="cat">' + opts('newsCat', x.cat) + '</select></div>');
    if (type === 'webinar') acf.push('<div class="acf-row"><div class="acf-field"><label>Start date & time (Mozambique time, CAT)</label><input type="datetime-local" name="start" value="' + (x.start ? new Date(Date.parse(x.start) + 2 * 3600e3).toISOString().slice(0, 16) : '') + '" style="width:100%"></div><div class="acf-field"><label>Platform</label><input type="text" name="platform" value="' + esc(x.platform || 'Zoom') + '"></div></div><div class="acf-row"><div class="acf-field"><label>Registration mode</label><select name="mode"><option value="form"' + (x.mode !== 'external' ? ' selected' : '') + '>On-site form (registrations stored)</option><option value="external"' + (x.mode === 'external' ? ' selected' : '') + '>Redirect to external platform</option></select></div><div class="acf-field"><label>External registration / join URL</label><input type="url" name="url" value="' + esc(x.url || '') + '"></div></div><div class="acf-field"><label>Recording URL (past webinars)</label><input type="url" name="recording" value="' + esc(x.recording || '') + '"></div>');
    var src = x.source ? '<div class="postbox"><h2 class="hndle">Sync source (read-only)</h2><div class="inside"><dl class="kv"><dt>Source</dt><dd>' + esc(x.source.name) + '</dd><dt>Original URL</dt><dd><a href="' + esc(x.source.url) + '" target="_blank">' + esc(x.source.url) + '</a></dd><dt>External ID</dt><dd><code>' + esc(x.source.externalId) + '</code></dd><dt>Imported</dt><dd>' + fdt(x.source.importedAt) + '</dd>' + (x.updatedAtSource ? '<dt>Updated at source</dt><dd>' + fdt(x.updatedAtSource) + '</dd>' : '') + '</dl></div></div>' : '';
    var trans = I18N.langs.map(function (l) { var has = l === 'en' || I18N.hasLang(x.title, l) || I18N.hasLang(x.overview, l); return '<p style="margin:4px 0;display:flex;justify-content:space-between"><span>' + I18N.meta[l].label + '</span><a href="#/' + (isNew ? 'new/' + type : 'edit/' + type + '/' + x.id) + '?lang=' + l + '">' + (l === lang ? '<b>editing</b>' : has ? '✏ edit' : '＋ add') + '</a></p>'; }).join('');
    return '<h1>' + (isNew ? 'Add New ' + cfg.single : 'Edit ' + cfg.single) + (isNew ? '' : ' <a href="#/new/' + type + '" class="button page-title-action">Add New</a>') + '</h1>' + flashHtml() +
      (x.sample ? '<div class="notice notice-info"><p>This is a <b>sample</b> record for the prototype.</p></div>' : '') +
      '<form data-f="edit" data-type="' + type + '" data-id="' + x.id + '" data-new="' + (isNew ? 1 : 0) + '" data-lang="' + lang + '"><div class="edit-layout"><div>' +
      (type !== 'supplier' ? '<div class="lang-tabs">' + I18N.langs.map(function (l) { return '<a href="#/' + (isNew ? 'new/' + type : 'edit/' + type + '/' + x.id) + '?lang=' + l + '" class="' + (l === lang ? 'on' : '') + '">' + I18N.meta[l].label + '</a>'; }).join('') + '</div>' : '') +
      (lang !== 'en' && !I18N.hasLang(x.title, lang) && type !== 'supplier' ? '<div class="notice notice-info"><p>No ' + I18N.meta[lang].label + ' translation yet. English original: <i>' + esc(L(x.title)) + '</i> <button type="button" class="button button-small" data-a="mt" data-lang="' + lang + '">Fill with machine translation (simulated)</button></p></div>' : '') +
      '<input type="text" id="title" name="title" value="' + esc(titleVal) + '" placeholder="Add title" aria-label="Title">' +
      '<div class="postbox"><h2 class="hndle">' + (type === 'supplier' ? 'Company overview' : 'Summary / excerpt') + ' <span style="font-weight:400;color:#646970">' + I18N.meta[lang].label + '</span></h2><div class="inside"><textarea name="text" rows="4">' + esc(type === 'supplier' ? ((x.overview || {})[lang] || '') : ((x[txtField] || x.summary || {})[lang] || '')) + '</textarea><p class="desc" style="color:#646970;margin:4px 0 0">Full body content is edited with the block editor (Gutenberg) in production.</p></div></div>' +
      '<div class="postbox"><h2 class="hndle">' + cfg.single + ' details <span style="font-weight:400;color:#646970">ACF field group</span></h2><div class="inside">' + acf.join('') + '</div></div>' + src + '</div>' +
      '<div><div class="postbox"><h2 class="hndle">Publish</h2><div class="inside"><p>Status: <select name="status"><option value="publish"' + ((x.status || 'publish') === 'publish' ? ' selected' : '') + '>Published</option><option value="draft"' + (x.status === 'draft' ? ' selected' : '') + '>Draft</option></select></p><p><label><input type="checkbox" name="premium"' + (x.premium ? ' checked' : '') + '> <b>Premium</b> (members only, MemberPress rule)</label></p>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #dcdcde;padding-top:10px;margin-top:10px">' + (isNew ? '<span></span>' : '<a href="#" style="color:#b32d2e" data-a="trash" data-t="' + type + '" data-id="' + x.id + '">Move to Trash</a>') + '<button class="button button-primary">' + (isNew ? 'Publish' : 'Update') + '</button></div>' + (isNew ? '' : '<p style="margin-top:10px"><a href="' + siteUrl(cfg.site + '/' + x.id).replace('#/en/', '#/' + lang + '/') + '" target="_blank">View on site (' + lang.toUpperCase() + ') ↗</a></p>') + '</div></div>' +
      '<div class="postbox"><h2 class="hndle">Language (WPML)</h2><div class="inside">' + trans + '</div></div></div></div></form>';
  }

  /* ---------------- data sync ---------------- */
  function syncSources() {
    var logs = Store.get('synclog', []), v = Store.get('sourceState', {}).s3 || 'v1';
    return '<h1>Data Sync <span class="pill blue">OilSkill Sync plugin</span></h1>' + flashHtml() +
      '<div class="notice"><p><b>How it works:</b> each source is fetched on schedule (daily WP-Cron + server cron), parsed, mapped to the target content type, checked for duplicates and changes, and held in the <a href="#/sync/queue">Review Queue</a> for editor approval before publishing. In this prototype the parsing, mapping, dedupe, update detection, validation, logging and review run for real; the network fetch uses bundled snapshots of each source (<i>simulated</i>).</p></div>' +
      '<div class="tablenav"><div class="acts"><button class="button button-primary" data-a="run-all">▶ Simulate scheduled cron run (all sources)</button></div><div class="acts"><span style="color:#646970">Next scheduled run: ' + fdt(new Date(new Date().setUTCHours(24, 0, 0, 0)).toISOString()) + ' (02:00 CAT)</span></div></div>' +
      '<table class="wp-list-table"><thead><tr><th>Source</th><th class="hide-sm">Type</th><th class="hide-sm">Target</th><th>Schedule</th><th>Publishing</th><th>Last run</th><th></th></tr></thead><tbody>' +
      Sync.sources.map(function (s) {
        var l = logs.filter(function (x) { return x.source === s.id; })[0];
        return '<tr><td><a class="row-title" href="#/sync/source/' + s.id + '">' + esc(s.name) + '</a><div style="color:#646970;font-size:12px">' + esc(s.standIn) + '</div><div class="mono" style="color:#646970">' + esc(s.url) + '</div>' +
          (s.id === 's3' ? '<div style="margin-top:6px">Test feed version: <select data-a="feedver">' + [['v1', 'v1: initial (3 items)'], ['v2', 'v2: 1 changed + 1 new'], ['broken', 'broken: malformed response']].map(function (o) { return '<option value="' + o[0] + '"' + (v === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' : '') + '</td>' +
          '<td class="hide-sm">' + s.type + '</td><td class="hide-sm">' + TYPES[s.target].label + '</td><td>' + s.schedule + '</td><td><span class="pill amber">Review before publish</span></td>' +
          '<td>' + (l ? '<span class="pill ' + (l.status === 'success' ? 'green' : l.status === 'warning' ? 'amber' : 'red') + '">' + l.status + '</span><br>' + fdt(l.end) + '<br><span style="color:#646970">' + l.created + ' new · ' + l.updated + ' upd · ' + l.duplicates + ' dup · ' + l.skipped + ' skip</span>' : '<span class="pill">never</span>') + '</td>' +
          '<td><button class="button" data-a="run" data-s="' + s.id + '">⟳ Run now</button></td></tr>';
      }).join('') + '</tbody></table><h2>Live run output</h2><div class="console" id="console"><span class="info">Click “Run now” to fetch, parse and map a source…</span></div>';
  }
  function syncSource(id) {
    var s = Sync.sources.filter(function (x) { return x.id === id; })[0];
    if (!s) return '<h1>Not found</h1>';
    return '<h1>' + esc(s.name) + ' <a href="#/sync" class="button page-title-action">← All sources</a></h1><div class="dash" style="grid-template-columns:1fr 1fr"><div><div class="postbox"><h2 class="hndle">Source configuration</h2><div class="inside"><dl class="kv"><dt>Stand-in for</dt><dd>' + esc(s.standIn) + '</dd><dt>Endpoint</dt><dd class="mono">' + esc(s.url) + '</dd><dt>Method</dt><dd>' + s.type + '</dd><dt>Target type</dt><dd>' + TYPES[s.target].label + '</dd><dt>Schedule</dt><dd>' + s.schedule + ' (24 h)</dd><dt>Publishing</dt><dd>Hold for review (auto-publish available)</dd><dt>Duplicate key</dt><dd>External ID → source URL → title + date hash</dd><dt>Update rule</dt><dd>Content hash changed → queued as update for review (never silently overwritten)</dd><dt>On failure</dt><dd>Log error, keep existing content, email admin, retry next run</dd><dt>Courtesy</dt><dd>Identified user-agent, respects robots.txt, rate-limited</dd></dl></div></div>' +
      (s.selectors ? '<div class="postbox"><h2 class="hndle">CSS selectors (scraper)</h2><div class="inside"><dl class="kv">' + Object.keys(s.selectors).map(function (k) { return '<dt>' + k + '</dt><dd class="mono">' + esc(s.selectors[k]) + '</dd>'; }).join('') + '</dl></div></div>' : '') +
      '<div class="postbox"><h2 class="hndle">Field mapping</h2><div class="inside"><table class="wp-list-table"><thead><tr><th>Source field</th><th>OilSkill field</th></tr></thead><tbody>' + s.map.map(function (m) { return '<tr><td class="mono">' + esc(m[0]) + '</td><td>' + esc(m[1]) + '</td></tr>'; }).join('') + '<tr><td class="mono">(constant)</td><td>Source name + attribution, imported date</td></tr></tbody></table></div></div></div>' +
      '<div><div class="postbox"><h2 class="hndle">Raw response preview <span style="font-weight:400;color:#646970">bundled snapshot</span></h2><div class="inside"><pre class="raw">' + esc(Sync.rawPreview(s)) + '</pre><button class="button button-primary" data-a="run" data-s="' + s.id + '">⟳ Run now</button></div></div><div class="console" id="console"></div></div></div>';
  }
  function queueView() {
    var q = Store.get('queue', []), st = R.q.status || 'pending';
    var rows = q.filter(function (x) { return x.status === st; });
    var cnt = function (s) { return q.filter(function (x) { return x.status === s; }).length; };
    return '<h1>Review Queue <span class="pill amber">' + cnt('pending') + ' pending</span></h1>' + flashHtml() +
      '<ul class="subsubsub">' + [['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(function (s, i) { return (i ? '| ' : '') + '<li><a href="#/sync/queue?status=' + s[0] + '" class="' + (st === s[0] ? 'current' : '') + '">' + s[1] + ' (' + cnt(s[0]) + ')</a></li>'; }).join('') + '</ul>' +
      (st === 'pending' && rows.length ? '<div class="tablenav"><div class="acts"><button class="button" data-a="bulk-approve">Approve all</button><button class="button" data-a="bulk-approve" data-tr="1">Approve all + machine-translate titles (simulated)</button></div></div>' : '<div style="height:10px"></div>') +
      '<table class="wp-list-table"><thead><tr><th>Imported record</th><th class="hide-sm">Mapped fields</th><th class="hide-sm">Source</th><th>Action</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (x) {
        var m = x.mapped;
        return '<tr><td><span class="pill ' + (x.kind === 'update' ? 'amber' : 'green') + '">' + (x.kind === 'update' ? 'UPDATE' : 'NEW') + '</span> → ' + TYPES[x.type].label + '<div class="row-title" style="margin-top:4px">' + esc(m.title) + '</div><div style="color:#646970">' + esc((m.summary || '').slice(0, 160)) + '</div>' +
          (x.kind === 'update' && x.previous ? '<div class="diff"><div class="old">' + esc(x.previous.summary || x.previous.title || '') + '</div><div class="newv">' + esc(m.summary) + '</div></div>' : '') +
          (x.type === 'opp' && !m.close ? '<div style="color:#b32d2e;margin-top:4px">⚠ Closing date “' + esc(m.closingRaw) + '” could not be parsed: set it before approving.</div>' : '') + '</td>' +
          '<td class="hide-sm"><dl class="kv" style="grid-template-columns:90px 1fr;font-size:12px"><dt>Sector</dt><dd>' + tax('sector', m.sector) + '</dd><dt>Location</dt><dd>' + tax('location', m.loc) + '</dd><dt>Date</dt><dd>' + fd(m.date) + '</dd>' + (m.close ? '<dt>Closing</dt><dd>' + fd(m.close) + '</dd>' : '') + (m.org ? '<dt>Org.</dt><dd>' + esc(m.org) + '</dd>' : '') + '<dt>Ext. ID</dt><dd class="mono">' + esc(m.externalId) + '</dd></dl></td>' +
          '<td class="hide-sm">' + esc(m.sourceName) + '<br><a href="' + esc(m.sourceUrl) + '" target="_blank" class="mono" style="font-size:11px">' + esc(m.sourceUrl) + '</a><br><span style="color:#646970">fetched ' + fdt(x.date) + '</span></td>' +
          '<td style="white-space:nowrap">' + (x.status === 'pending' ? '<button class="button button-primary button-small" data-a="approve" data-q="' + x.qid + '">✓ Approve</button><br>' + (Sync.hasMT(m.externalId) ? '<button class="button button-small" style="margin-top:4px" data-a="approve" data-tr="1" data-q="' + x.qid + '">✓ Approve + translate</button><br>' : '') + '<button class="button button-small" style="margin-top:4px" data-a="qedit" data-q="' + x.qid + '">✏ Edit mapping</button><br><button class="button button-small button-link-delete" style="margin-top:4px" data-a="reject" data-q="' + x.qid + '">✗ Reject</button>'
            : x.status === 'approved' ? '<span class="pill green">approved</span><br><a href="' + siteUrl(TYPES[x.type].site + '/' + x.publishedId) + '" target="_blank">View on site ↗</a><br><span style="color:#646970">' + fdt(x.reviewed) + '</span>' : '<span class="pill red">rejected</span><br><span style="color:#646970">Will not be re-imported</span>') + '</td></tr>';
      }).join('') : '<tr><td colspan="4">No ' + st + ' items. ' + (st === 'pending' ? '<a href="#/sync">Run a sync →</a>' : '') + '</td></tr>') + '</tbody></table>';
  }
  function logsView() {
    var logs = Store.get('synclog', []);
    return '<h1>Sync Logs</h1><table class="wp-list-table"><thead><tr><th>Run</th><th>Source</th><th>Trigger</th><th>Result</th><th class="hide-sm">Counts</th></tr></thead><tbody>' +
      (logs.length ? logs.map(function (l) { return '<tr><td>' + fdt(l.start) + '<div class="row-actions" style="visibility:visible"><a href="#" data-a="showlog" data-l="' + l.id + '">View details</a></div></td><td>' + esc(l.sourceName) + '</td><td>' + l.trigger + '</td><td><span class="pill ' + (l.status === 'success' ? 'green' : l.status === 'warning' ? 'amber' : 'red') + '">' + l.status + '</span>' + (l.errors.length ? '<div style="color:#b32d2e;font-size:12px;margin-top:4px">' + l.errors.map(esc).join('<br>') + '</div>' : '') + '</td><td class="hide-sm">fetched ' + l.fetched + ' · new ' + l.created + ' · updated ' + l.updated + ' · duplicate ' + l.duplicates + ' · skipped ' + l.skipped + '</td></tr><tr id="log-' + l.id + '" style="display:none"><td colspan="5"><div class="console">' + consoleLines(l) + '</div></td></tr>'; }).join('') : '<tr><td colspan="5">No runs yet.</td></tr>') + '</tbody></table>';
  }
  function consoleLines(l) { return l.lines.map(function (x) { return '<div class="' + x.level + '">[' + x.level.toUpperCase() + '] ' + esc(x.msg) + '</div>'; }).join(''); }
  function runAnimated(ids, trigger) {
    var c = document.getElementById('console'); if (c) c.innerHTML = '';
    var all = [];
    ids.forEach(function (id) { all.push({ head: true, msg: '── ' + Sync.sources.filter(function (s) { return s.id === id; })[0].name + ' · ' + new Date().toLocaleTimeString('en-GB') + ' ──' }); var l = Sync.run(id, trigger); l.lines.forEach(function (x) { all.push(x); }); });
    var i = 0;
    (function step() {
      if (!c) { done(); return; }
      if (i >= all.length) { done(); return; }
      var x = all[i++], d = document.createElement('div');
      d.className = x.head ? 'info' : x.level; d.style.fontWeight = x.head ? '700' : ''; d.textContent = x.head ? x.msg : '[' + x.level.toUpperCase() + '] ' + x.msg;
      c.appendChild(d); c.scrollTop = c.scrollHeight; setTimeout(step, 140);
    })();
    function done() { var n = Store.get('queue', []).filter(function (x) { return x.status === 'pending'; }).length; toast('Sync finished: ' + n + ' item(s) awaiting review'); var sb = document.getElementById('menu'); if (sb) sb.outerHTML = menu(); var ab = document.getElementById('adminbar'); if (ab) ab.outerHTML = bar(); if (c) { var a = document.createElement('div'); a.innerHTML = '<a href="#/sync/queue" style="color:#79c0ff">→ Open Review Queue (' + n + ' pending)</a>'; c.appendChild(a); } }
  }

  /* ---------------- membership ---------------- */
  function members() {
    var users = Store.users().filter(function (u) { return u.role === 'subscriber'; });
    return '<h1>Members <span class="pill">MemberPress</span></h1>' + flashHtml() + '<table class="wp-list-table"><thead><tr><th>Member</th><th class="hide-sm">Organisation</th><th>Membership</th><th>Status</th><th class="hide-sm">Language</th><th class="hide-sm">Registered</th></tr></thead><tbody>' +
      users.map(function (u) { var s = Store.subFor(u.id); return '<tr><td><b>' + esc(u.first + ' ' + u.last) + '</b><br><span style="color:#646970">' + esc(u.email) + '</span></td><td class="hide-sm">' + esc(u.org) + '<br><span style="color:#646970">' + esc(u.job || '') + ', ' + esc(u.country) + '</span></td><td>' + (s ? planName(s.plan) : 'Registered (free)') + '</td><td>' + statusPill(s) + '</td><td class="hide-sm">' + I18N.meta[u.lang || 'en'].label + '</td><td class="hide-sm">' + fd(u.created) + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  function statusPill(s) { if (!s) return '<span class="pill">free</span>'; return '<span class="pill ' + ({ active: 'green', cancelled: 'amber', expired: '', pending: 'red' })[s.status] + '">' + s.status + '</span>'; }
  function plansView() {
    return '<h1>Memberships <span class="pill">MemberPress</span></h1><table class="wp-list-table"><thead><tr><th>Membership</th><th>Price</th><th>Billing</th><th>Members</th></tr></thead><tbody>' +
      D.PLANS.map(function (p) { return '<tr><td><b>' + planName(p.id) + '</b></td><td>' + (p.price ? money(p.price) : 'Free') + '</td><td>' + (p.cycle ? 'Recurring every ' + p.cycle + ' via PayFast subscription' : 'n/a') + '</td><td>' + Store.get('subs', []).filter(function (s) { return s.plan === p.id && (s.status === 'active' || s.status === 'cancelled'); }).length + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2>Access rules</h2><table class="wp-list-table"><thead><tr><th>Content</th><th>Rule</th><th>Access</th></tr></thead><tbody>' +
      [['Intelligence items marked Premium', 'Custom field “premium” = true', 'Professional, Corporate'], ['Opportunity documents & buyer contacts (Premium opportunities)', 'Custom field “premium” = true', 'Professional, Corporate'], ['Supplier contact details', 'Partial (shortcode)', 'Professional, Corporate'], ['Member-only webinars & recordings', 'Custom field “premium” = true', 'Professional, Corporate'], ['Member dashboard', 'Logged in', 'All registered users']].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table><p style="color:#646970">Cancelled members keep access until the end of the paid period; expired members revert to Registered (free).</p>';
  }
  function subsView() {
    var subs = Store.get('subs', []);
    return '<h1>Subscriptions <span class="pill">MemberPress + PayFast (sandbox, simulated)</span></h1>' + flashHtml() + '<div class="notice"><p>Use these actions to demonstrate lifecycle events that normally arrive from the payment gateway (ITN callbacks) or the daily expiry job. Then log in on the site as that member to see the effect.</p></div>' +
      '<table class="wp-list-table"><thead><tr><th>Member</th><th>Membership</th><th>Status</th><th class="hide-sm">Started</th><th>Renews / Expires</th><th class="hide-sm">Gateway token</th><th>Actions</th></tr></thead><tbody>' +
      subs.map(function (s) { var u = Store.user(s.user); return '<tr><td><b>' + esc(u ? u.first + ' ' + u.last : s.user) + '</b><br><span style="color:#646970">' + esc(u ? u.email : '') + '</span></td><td>' + planName(s.plan) + '</td><td>' + statusPill(s) + '</td><td class="hide-sm">' + fd(s.start) + '</td><td>' + (s.renews ? 'Renews ' + fd(s.renews) : s.expires ? (s.status === 'expired' ? 'Expired ' : 'Access until ') + fd(s.expires) : '–') + '</td><td class="hide-sm mono">' + (s.gatewayRef || '–') + '</td><td>' +
        (s.status === 'active' ? '<button class="button button-small" data-a="renew" data-s="' + s.id + '">Simulate renewal ITN</button> <button class="button button-small" data-a="renewfail" data-s="' + s.id + '">Renewal fails</button> <button class="button button-small" data-a="cancel" data-s="' + s.id + '">Cancel</button>' : '') +
        (s.status === 'cancelled' ? '<button class="button button-small" data-a="expire" data-s="' + s.id + '">Run expiry now (time-shift)</button>' : '') +
        (s.status === 'expired' || s.status === 'pending' ? '<button class="button button-small" data-a="reactivate" data-s="' + s.id + '">Mark active (manual)</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  function txnsView() {
    var tx = Store.get('txns', []);
    return '<h1>Transactions</h1>' + flashHtml() + '<table class="wp-list-table"><thead><tr><th>Reference</th><th>Member</th><th class="hide-sm">Membership</th><th>Type</th><th>Amount</th><th>Status</th><th class="hide-sm">Date</th><th></th></tr></thead><tbody>' +
      tx.map(function (x) { var u = Store.user(x.user); return '<tr><td class="mono">' + x.id + '</td><td>' + esc(u ? u.first + ' ' + u.last : '') + '</td><td class="hide-sm">' + planName(x.plan) + '</td><td>' + x.type + '</td><td>' + money(x.amount) + '</td><td><span class="pill ' + (x.status === 'complete' ? 'green' : x.status === 'refunded' ? '' : 'red') + '">' + x.status + '</span>' + (x.note ? '<br><span style="color:#646970;font-size:12px">' + esc(x.note) + '</span>' : '') + '</td><td class="hide-sm">' + fdt(x.date) + '</td><td>' + (x.status === 'complete' ? '<button class="button button-small" data-a="refund" data-x="' + x.id + '">Refund</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table><p style="color:#646970">Refunds are processed in the PayFast merchant dashboard; the status is synchronised back to MemberPress.</p>';
  }
  function paymentsView() {
    return '<h1>Payment Gateways <span class="pill">MemberPress › Settings › Payments</span></h1><div class="notice notice-warning"><p>Configuration shown for illustration. Live activation requires an approved PayFast (or alternative) merchant account in OilSkill’s name: business registration, bank account and KYC documents.</p></div>' +
      '<div class="dash" style="grid-template-columns:1fr 1fr"><div class="postbox"><h2 class="hndle">PayFast <span class="pill green">Primary · Sandbox mode</span></h2><div class="inside"><div class="acf-field"><label>Merchant ID</label><input type="text" value="10000100" readonly><div class="desc">PayFast public sandbox merchant</div></div><div class="acf-field"><label>Merchant Key</label><input type="text" value="••••••••••••" readonly></div><div class="acf-field"><label>Passphrase</label><input type="password" value="placeholder" readonly></div><div class="acf-field"><label>Mode</label><select disabled><option>Sandbox (sandbox.payfast.co.za)</option><option>Live</option></select></div><div class="acf-field"><label>ITN (notify) URL</label><input type="text" value="https://oilskill.example/mepr/notify/payfast/itn" readonly style="width:100%"></div><div class="acf-field"><label>Recurring billing</label><input type="checkbox" checked disabled> Subscriptions (token-based)</div><div class="acf-field"><label>Currency</label><input type="text" value="ZAR (per PayFast; to be confirmed)" readonly></div></div></div>' +
      '<div class="postbox"><h2 class="hndle">Peach Payments <span class="pill">Alternative · not enabled</span></h2><div class="inside"><p>Fallback gateway if PayFast merchant approval is not granted. One gateway is integrated within the SOW scope.</p><p style="color:#646970">Mozambique-local options (M-Pesa, e-Mola) can be assessed as a change request.</p></div></div></div>';
  }

  /* ---------------- webinars, enquiries, media, pages ---------------- */
  function regsView() {
    var regs = Store.get('regs', []), w = R.q.w || '';
    var rows = regs.filter(function (r) { return !w || r.webinar === w; });
    return '<h1>Webinar Registrations <button class="button page-title-action" data-a="csv">⬇ Export CSV</button></h1><form class="tablenav" data-f="regfilter"><div class="acts"><select name="w"><option value="">All webinars</option>' + Repo.all('webinar').map(function (x) { return '<option value="' + x.id + '"' + (w === x.id ? ' selected' : '') + '>' + esc(L(x.title)) + '</option>'; }).join('') + '</select><button class="button">Filter</button></div><span style="color:#646970">' + rows.length + ' registration(s)</span></form>' +
      '<table class="wp-list-table"><thead><tr><th>Name</th><th>Email</th><th class="hide-sm">Organisation</th><th>Webinar</th><th>Lang</th><th class="hide-sm">Registered</th></tr></thead><tbody>' + (rows.length ? rows.map(function (r) { var x = Repo.get('webinar', r.webinar); return '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.email) + '</td><td class="hide-sm">' + esc(r.org || '') + '</td><td>' + esc(x ? L(x.title) : r.webinar) + '</td><td>' + r.lang.toUpperCase() + '</td><td class="hide-sm">' + fdt(r.date) + '</td></tr>'; }).join('') : '<tr><td colspan="6">No registrations.</td></tr>') + '</tbody></table>';
  }
  function enquiries() {
    var c = Store.get('contacts', []);
    return '<h1>Enquiries <span class="pill">Contact form entries</span></h1><table class="wp-list-table"><thead><tr><th>From</th><th>Subject</th><th>Message</th><th>Lang</th><th class="hide-sm">Date</th></tr></thead><tbody>' + (c.length ? c.map(function (x) { return '<tr><td><b>' + esc(x.name) + '</b><br>' + esc(x.email) + '<br><span style="color:#646970">' + esc(x.org || '') + '</span></td><td>' + esc(x.subject) + '</td><td>' + esc(x.message) + '</td><td>' + x.lang.toUpperCase() + '</td><td class="hide-sm">' + fdt(x.date) + '</td></tr>'; }).join('') : '<tr><td colspan="5">No enquiries yet. Submit the <a href="index.html#/en/contact" target="_blank">Contact form</a>.</td></tr>') + '</tbody></table>';
  }
  function media() {
    return '<h1>Media Library</h1><div class="notice notice-warning"><p>Image register: licensed Mozambican project photography to be supplied. Each file records subject, actual location/project, source, licence and credit. Missing files show illustrated placeholders on the site.</p></div><table class="wp-list-table"><thead><tr><th>File</th><th>Subject</th><th>Actual location / project</th><th class="hide-sm">Proposed source</th><th>Credit</th><th>Status</th></tr></thead><tbody>' +
      Object.keys(D.IMAGES).map(function (k) { var im = D.IMAGES[k]; return '<tr><td class="mono">' + im.file.split('/').pop() + '</td><td>' + esc(L(im.subject)) + '</td><td>' + esc(im.place) + '</td><td class="hide-sm">' + esc(im.source) + '</td><td>' + esc(im.credit) + '</td><td><span class="pill amber">to source</span></td></tr>'; }).join('') + '</tbody></table>';
  }
  function pages() {
    var pg = ['Home', 'About OilSkill', 'Membership / Subscription Plans', 'Contact Us', 'Privacy Policy', 'Terms & Conditions', 'Member Dashboard', 'Login', 'Register', 'Image credits', 'Demo guide'];
    return '<h1>Pages</h1><table class="wp-list-table"><thead><tr><th>Title</th><th>Languages</th><th>Status</th></tr></thead><tbody>' + pg.map(function (p) { return '<tr><td>' + (p === 'Home' ? '<a class="row-title" href="#/pages/home">Home</a> — <span style="color:#646970">Front Page</span><div class="row-actions" style="visibility:visible"><a href="#/pages/home">Edit</a> | <a href="index.html" target="_blank">View</a></div>' : '<span class="row-title">' + p + '</span>') + '</td><td><span class="lang-ic ok">EN</span><span class="lang-ic mt">PT</span><span class="lang-ic mt">FR</span></td><td>' + (/Privacy|Terms/.test(p) ? '<span class="pill amber">Draft text: awaiting OilSkill legal copy</span>' : 'Published') + '</td></tr>'; }).join('') + '</tbody></table>';
  }

  /* ---------------- WPML ---------------- */
  function wpml() {
    return '<h1>WPML › Languages</h1><div class="dash" style="grid-template-columns:1fr 1fr"><div class="postbox"><h2 class="hndle">Site languages</h2><div class="inside"><table class="wp-list-table"><thead><tr><th>Language</th><th>Code</th><th>Locale</th><th>Default</th></tr></thead><tbody>' + I18N.langs.map(function (l) { return '<tr><td>' + I18N.meta[l].label + '</td><td>' + l + '</td><td>' + I18N.meta[l].locale.replace('-', '_') + '</td><td>' + (l === 'en' ? '✓' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="postbox"><h2 class="hndle">Settings</h2><div class="inside"><dl class="kv"><dt>Language URL format</dt><dd>Directory: <code>/pt/</code>, <code>/fr/</code></dd><dt>Switcher</dt><dd>Header (desktop + mobile menu) and footer</dd><dt>Browser language</dt><dd>Suggest, never force redirect</dd><dt>hreflang</dt><dd>Enabled</dd><dt>Translated</dt><dd>Pages, CPTs, taxonomies, ACF fields, menus, widgets, MemberPress & form strings, emails</dd><dt>Translation method</dt><dd>WPML Advanced Translation Editor (machine draft) + human review</dd></dl></div></div></div>';
  }
  function translations() {
    return '<h1>WPML › Translation Management</h1><table class="wp-list-table"><thead><tr><th>Content type</th><th>Items</th><th>Portuguese</th><th>French</th></tr></thead><tbody>' +
      Object.keys(TYPES).map(function (k) { var all = Repo.all(k), c = function (l) { return all.filter(function (x) { return I18N.hasLang(x.title, l) || I18N.hasLang(x.overview, l) || k === 'supplier'; }).length; }; return '<tr><td><a href="#/list/' + k + '">' + TYPES[k].label + '</a></td><td>' + all.length + '</td><td>' + c('pt') + ' / ' + all.length + '</td><td>' + c('fr') + ' / ' + all.length + '</td></tr>'; }).join('') +
      '<tr><td>Interface strings</td><td>' + I18N.keys.length + '</td><td>' + I18N.keys.length + ' / ' + I18N.keys.length + '</td><td>' + I18N.keys.length + ' / ' + I18N.keys.length + '</td></tr></tbody></table><p style="color:#646970">Imported items arrive in the source language and appear with a “translation pending” label in PT/FR until translated (approve with translation in the Review Queue, or add translations in the editor).</p>';
  }
  function strings() {
    var q = (R.q.s || '').toLowerCase(), over = Store.get('strings', {});
    var keys = I18N.keys.filter(function (k) { return !q || k.indexOf(q) >= 0 || I18N.raw(k, 'en').toLowerCase().indexOf(q) >= 0; }).slice(0, 60);
    return '<h1>WPML › String Translation</h1>' + flashHtml() + '<div class="notice"><p>Edit any interface, form, validation or email string. Changes apply on the site immediately (try <i>err.required</i> or <i>home.hero.title</i>).</p></div><form class="tablenav" data-f="strsearch"><div class="acts"><input type="search" name="s" value="' + esc(R.q.s || '') + '" placeholder="Search strings"><button class="button">Search</button></div><span style="color:#646970">Showing ' + keys.length + ' of ' + I18N.keys.length + '</span></form>' +
      '<table class="wp-list-table"><thead><tr><th>Context / name</th><th>English (original)</th><th>Português</th><th>Français</th><th></th></tr></thead><tbody>' +
      keys.map(function (k) { return '<tr><td class="mono" style="font-size:11px">' + k + '</td><td>' + esc(I18N.raw(k, 'en')) + '</td>' + ['pt', 'fr'].map(function (l) { return '<td><textarea rows="2" data-k="' + k + '" data-l="' + l + '" style="font-size:12px' + ((over[l] || {})[k] ? ';border-color:#dba617' : '') + '">' + esc(I18N.t(k, null, l)) + '</textarea></td>'; }).join('') + '<td><button class="button button-small" data-a="savestr" data-k="' + k + '">Save</button></td></tr>'; }).join('') + '</tbody></table>';
  }

  /* ---------------- users, mail, settings ---------------- */
  function usersView() {
    var u = Store.users();
    return '<h1>Users</h1><table class="wp-list-table"><thead><tr><th>Username / Email</th><th>Name</th><th>Role</th><th class="hide-sm">Registered</th></tr></thead><tbody>' + u.map(function (x) { return '<tr><td>' + esc(x.email) + '</td><td>' + esc(x.first + ' ' + x.last) + '</td><td>' + ({ administrator: 'Administrator', editor: 'Editor (content & data reviewer)', subscriber: 'Member' })[x.role] + '</td><td class="hide-sm">' + fd(x.created) + '</td></tr>'; }).join('') + '</tbody></table><h2>Role permissions</h2><table class="wp-list-table"><thead><tr><th>Capability</th><th>Administrator</th><th>Editor</th><th>Member</th></tr></thead><tbody>' +
      [['Create/edit/publish content', '✓', '✓', ''], ['Review & approve imported data', '✓', '✓', ''], ['Manage members & subscriptions', '✓', 'view', ''], ['Payment gateway settings', '✓', '', ''], ['Plugins, users, settings', '✓', '', ''], ['Premium content on site', '✓', '✓', 'per membership']].map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  function mailView() {
    var m = Store.get('mail', []), id = R.q.id, sel = m.filter(function (x) { return x.id === id; })[0] || m[0];
    function render(x) { return { s: I18N.t(x.subjectKey + '.s', x.vars, x.lang), b: I18N.t(x.subjectKey + '.b', x.vars, x.lang) }; }
    return '<h1>Mail Log <span class="pill">WP Mail Logging</span></h1><div class="notice"><p>Emails are captured instead of sent in the prototype. Each is generated in the recipient’s preferred language.</p></div><div class="dash" style="grid-template-columns:1.2fr 1fr"><table class="wp-list-table"><thead><tr><th>To</th><th>Subject</th><th>Lang</th><th class="hide-sm">Time</th></tr></thead><tbody>' +
      (m.length ? m.map(function (x) { var r = render(x); return '<tr' + (sel && sel.id === x.id ? ' style="background:#f0f6fc"' : '') + '><td>' + esc(x.to) + '</td><td><a href="#/mail?id=' + x.id + '">' + esc(r.s) + '</a></td><td>' + x.lang.toUpperCase() + '</td><td class="hide-sm">' + fdt(x.date) + '</td></tr>'; }).join('') : '<tr><td colspan="4">No emails yet. Register, pay, cancel or submit a form on the site.</td></tr>') + '</tbody></table>' +
      (sel ? (function () { var r = render(sel); return '<div><div class="mail-prev"><div class="mh">OILSKILL</div><div class="mb"><p style="color:#646970;font-size:12px;margin-top:0">To: ' + esc(sel.to) + '<br>Subject: <b style="color:#1d2327">' + esc(r.s) + '</b></p><p>' + esc(r.b) + '</p><p><a style="background:#E4572E;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;display:inline-block" href="index.html#/' + sel.lang + '/account" target="_blank">OilSkill →</a></p></div><div class="mf">' + esc(I18N.t('footer.rights', null, sel.lang)) + '</div></div></div>'; })() : '') + '</div>';
  }
  function settings() {
    return '<h1>Settings</h1><div class="postbox"><h2 class="hndle">Prototype data</h2><div class="inside"><p>Reset all content edits, imports, members, subscriptions, logs and emails to the original sample state.</p><button class="button button-link-delete" data-a="reset">Reset demo data</button></div></div><div class="postbox"><h2 class="hndle">Production plugin stack (per SOW)</h2><div class="inside"><ul style="margin:0;padding-left:18px;line-height:1.9"><li>Advanced Custom Fields Pro: content structures</li><li>MemberPress: memberships, rules, subscriptions</li><li>WPML Multilingual CMS: EN / PT / FR</li><li>WP Rocket: performance & caching</li><li>OilSkill Data Sync: custom plugin (sources, mapping, cron, review, logs)</li><li>SEO plugin, GA4, cookie consent, security hardening, backups</li></ul></div></div>';
  }

  /* ---------------- Pages › Home editor (ACF flexible content + WPML language tabs) ---------------- */
  var HE = { draft: null, lang: 'en', dirty: false, device: 'desktop', keep: false };
  var SEC_LABEL = { stats: 'Key figures strip', opps: 'Latest business opportunities', projects: 'Mozambique gas projects', intel: 'Featured intelligence', audience: 'Audience / value chain', suppliers: 'Featured suppliers', newsweb: 'News & upcoming webinars', cta: 'Membership & newsletter banner' };
  var LINKS = [['opps', 'Opportunities'], ['intel', 'Intelligence'], ['suppliers', 'Supplier Directory'], ['news', 'News'], ['webinars', 'Webinars'], ['membership', 'Membership plans'], ['register', 'Register'], ['about', 'About'], ['contact', 'Contact'], ['guide', 'Demo guide']];
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function heMl(path, label, obj, area, help) {
    obj = obj || {};
    return '<div class="acf-field"><label>' + label + ' <span class="ml-tag"></span></label>' + I18N.langs.map(function (l) {
      var v = obj[l] || '', ph = l !== 'en' && obj.en ? 'Empty: English is shown (' + obj.en.slice(0, 60) + (obj.en.length > 60 ? '…' : '') + ')' : '';
      return area ? '<textarea rows="3" class="ml-in" data-p="' + path + '" data-l="' + l + '" placeholder="' + esc(ph) + '">' + esc(v) + '</textarea>'
        : '<input type="text" class="ml-in" data-p="' + path + '" data-l="' + l + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '">';
    }).join('') + (help ? '<div class="desc">' + help + '</div>' : '') + '</div>';
  }
  function heSel(path, options, val, num) { return '<select data-p="' + path + '"' + (num ? ' data-num="1"' : '') + '>' + options.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
  function heLinkSel(path, val) { var o = LINKS.slice(); if (val && !o.some(function (x) { return x[0] === val; })) o.push([val, val]); return heSel(path, o, val); }
  function imgOpts() { return Object.keys(D.IMAGES).map(function (k) { return [k, L(D.IMAGES[k].subject) + ' (' + D.IMAGES[k].place.split(',')[0] + ')']; }); }
  function triWalk(o, fn) { if (!o || typeof o !== 'object') return; if ('en' in o && 'pt' in o && 'fr' in o && typeof o.en === 'string') { fn(o); return; } Object.keys(o).forEach(function (k) { triWalk(o[k], fn); }); }
  function emptyCount(d, l) { var n = 0; triWalk(d, function (o) { if (o.en && !o[l]) n++; }); return n; }

  function secFields(s, i) {
    var p = 'sections.' + i + '.', f = '';
    if (s.id === 'stats') f = '<p class="desc" style="color:#646970;margin:0">Figures are calculated automatically from published content (open opportunities, suppliers, intelligence reports, languages).</p>';
    if (s.id === 'opps') f = heMl(p + 'eyebrow', 'Small label', s.eyebrow) + heMl(p + 'heading', 'Heading', s.heading) + '<div class="acf-field"><label>Number of opportunities shown</label>' + heSel(p + 'count', [[2, '2'], [4, '4'], [6, '6'], [8, '8']], s.count, 1) + '<div class="desc">Newest open opportunities are shown automatically. Manage them under <a href="#/list/opp">Opportunities</a>.</div></div>';
    if (s.id === 'projects') {
      f = heMl(p + 'eyebrow', 'Small label', s.eyebrow) + heMl(p + 'heading', 'Heading', s.heading) + heMl(p + 'intro', 'Intro text', s.intro, true) +
        '<div class="acf-field"><label>Project cards (' + HE.draft.projects.length + ')</label>' + HE.draft.projects.map(function (pr, j) {
          var q = 'projects.' + j + '.';
          return '<div class="he-card"><div class="he-card-h"><b>' + (j + 1) + '. ' + esc(pr.name || 'Untitled') + '</b><span><button type="button" class="button button-small" data-a="he-pmove" data-i="' + j + '" data-d="-1"' + (j === 0 ? ' disabled' : '') + ' title="Move up">↑</button> <button type="button" class="button button-small" data-a="he-pmove" data-i="' + j + '" data-d="1"' + (j === HE.draft.projects.length - 1 ? ' disabled' : '') + ' title="Move down">↓</button> <button type="button" class="button button-small button-link-delete" data-a="he-pdel" data-i="' + j + '">Remove</button></span></div>' +
            '<div class="acf-row"><div class="acf-field"><label>Project name</label><input type="text" data-p="' + q + 'name" value="' + esc(pr.name) + '"></div><div class="acf-field"><label>Operator / area</label><input type="text" data-p="' + q + 'operator" value="' + esc(pr.operator) + '"></div></div>' +
            '<div class="acf-row"><div class="acf-field"><label>Location</label><select data-p="' + q + 'loc">' + opts('location', pr.loc) + '</select></div><div class="acf-field"><label>Image</label>' + heSel(q + 'img', imgOpts(), pr.img) + '</div></div>' + heMl(q + 'text', 'Description', pr.text, true) + '</div>';
        }).join('') + '<button type="button" class="button" data-a="he-padd">＋ Add project card</button><div class="desc">Facts must be verified against official operator sources before launch.</div></div>';
    }
    if (s.id === 'intel') {
      var all = Repo.all('intel');
      f = heMl(p + 'eyebrow', 'Small label', s.eyebrow) + heMl(p + 'heading', 'Heading', s.heading) +
        '<div class="acf-row"><div class="acf-field"><label>Number shown</label>' + heSel(p + 'count', [[3, '3'], [6, '6']], s.count, 1) + '</div><div class="acf-field"><label>Which items</label><label style="font-weight:400"><input type="radio" name="he-mode-' + i + '" data-p="' + p + 'mode" value="latest"' + (s.mode !== 'pick' ? ' checked' : '') + '> Latest published</label><label style="font-weight:400"><input type="radio" name="he-mode-' + i + '" data-p="' + p + 'mode" value="pick"' + (s.mode === 'pick' ? ' checked' : '') + '> Hand-picked (below)</label></div></div>' +
        '<div class="acf-field"><label>Hand-picked items</label><div class="he-pick">' + all.map(function (x) { return '<label style="font-weight:400;display:flex;gap:6px;margin:3px 0"><input type="checkbox" data-pick="' + i + '" value="' + x.id + '"' + ((s.pick || []).indexOf(x.id) >= 0 ? ' checked' : '') + '> ' + esc(L(x.title)) + (x.premium ? ' <span class="pill amber">Premium</span>' : '') + '</label>'; }).join('') + '</div></div>';
    }
    if (s.id === 'audience') f = heMl(p + 'eyebrow', 'Small label', s.eyebrow) + heMl(p + 'heading', 'Heading', s.heading) + '<p class="desc" style="color:#646970">The four audience cards use interface strings: edit them in <a href="#/strings?s=aud.">WPML › String Translation</a>.</p>';
    if (s.id === 'suppliers') f = heMl(p + 'eyebrow', 'Small label', s.eyebrow) + heMl(p + 'heading', 'Heading', s.heading) + '<div class="acf-field"><label>Number shown</label>' + heSel(p + 'count', [[2, '2'], [4, '4'], [6, '6']], s.count, 1) + '<div class="desc">Shows suppliers ticked <b>Featured on homepage</b> in <a href="#/list/supplier">Suppliers</a> (' + Repo.all('supplier').filter(function (x) { return x.featured; }).length + ' featured now).</div></div>';
    if (s.id === 'newsweb') f = heMl(p + 'heading', 'News column heading', s.heading) + heMl(p + 'heading2', 'Webinars column heading', s.heading2) + '<div class="acf-field"><label>Items per column</label>' + heSel(p + 'count', [[2, '2'], [3, '3'], [4, '4'], [5, '5']], s.count, 1) + '</div>';
    if (s.id === 'cta') f = heMl(p + 'eyebrow', 'Small label', s.eyebrow) + heMl(p + 'heading', 'Heading', s.heading) + heMl(p + 'intro', 'Text', s.intro, true) + heMl(p + 'btn', 'Button label', s.btn) +
      '<div class="acf-field"><label><input type="checkbox" data-p="' + p + 'showNewsletter"' + (s.showNewsletter ? ' checked' : '') + '> Show newsletter sign-up</label></div>' + heMl(p + 'heading2', 'Newsletter heading', s.heading2) + heMl(p + 'intro2', 'Newsletter text', s.intro2, true);
    return '<div class="postbox' + (s.show ? '' : ' he-off') + '" id="he-sec-' + s.id + '"><h2 class="hndle"><span>' + (i + 1) + '. ' + SEC_LABEL[s.id] + (s.show ? '' : ' <span class="pill">hidden</span>') + '</span><span style="font-weight:400;color:#646970;font-size:12px">section</span></h2><div class="inside">' + f + '</div></div>';
  }

  function homeEditor() {
    if (!HE.keep || !HE.draft) { HE.draft = HomeCfg.get(); HE.dirty = false; }
    HE.keep = false;
    var d = HE.draft, h = d.hero, l = HE.lang;
    var tabs = I18N.langs.map(function (x) { var n = x === 'en' ? 0 : emptyCount(d, x); return '<a href="#" data-a="he-lang" data-lang="' + x + '" class="' + (x === l ? 'on' : '') + '">' + I18N.meta[x].label + (n ? ' <span class="pill amber" title="Empty fields fall back to English">' + n + ' empty</span>' : (x === 'en' ? '' : ' <span class="pill green">✓</span>')) + '</a>'; }).join('');
    var heroBox = '<div class="postbox"><h2 class="hndle"><span>Hero banner</span><span style="font-weight:400;color:#646970;font-size:12px">always first</span></h2><div class="inside">' +
      heMl('hero.eyebrow', 'Small label above heading', h.eyebrow) + heMl('hero.title', 'Main heading', h.title, false, 'Required in English.') + heMl('hero.text', 'Intro text', h.text, true) +
      '<div class="acf-row"><div>' + heMl('hero.cta1', 'Primary button label', h.cta1) + '<div class="acf-field"><label>Primary button links to</label>' + heLinkSel('hero.cta1Link', h.cta1Link) + '</div></div><div>' + heMl('hero.cta2', 'Secondary button label', h.cta2) + '<div class="acf-field"><label>Secondary button links to</label>' + heLinkSel('hero.cta2Link', h.cta2Link) + '</div></div></div>' +
      '<div class="acf-field"><label><input type="checkbox" data-p="hero.showSearch"' + (h.showSearch ? ' checked' : '') + '> Show search box</label></div>' + heMl('hero.search', 'Search placeholder', h.search) +
      '<div class="acf-row"><div class="acf-field"><label>Background image (Media Library)</label>' + heSel('hero.img', imgOpts(), h.img) + '<div class="desc">Licensed photos placed in <code>assets/img/photos/</code> replace the illustration automatically.</div></div><div class="acf-field"><label>Or custom image URL</label><input type="text" data-p="hero.imgUrl" value="' + esc(h.imgUrl) + '" placeholder="assets/img/photos/my-photo.jpg"><div class="desc">Overrides the Media Library choice when filled.</div></div></div>' +
      heMl('hero.caption', 'Image caption / credit', h.caption, false, 'Leave empty to show the automatic credit from the image register.') + '</div></div>';
    var secRows = d.sections.map(function (s, i) { return '<div class="he-row"><label><input type="checkbox" data-p="sections.' + i + '.show"' + (s.show ? ' checked' : '') + '> <a href="#" data-a="he-jump" data-id="' + s.id + '">' + SEC_LABEL[s.id] + '</a></label><span><button type="button" class="button button-small" data-a="he-move" data-i="' + i + '" data-d="-1"' + (i === 0 ? ' disabled' : '') + ' title="Move up">↑</button><button type="button" class="button button-small" data-a="he-move" data-i="' + i + '" data-d="1"' + (i === d.sections.length - 1 ? ' disabled' : '') + ' title="Move down">↓</button></span></div>'; }).join('');
    var u = me();
    return '<h1>Edit Page: Home <span class="pill purple">ACF flexible content · WPML</span> <a href="index.html#/' + l + '/" target="_blank" class="button page-title-action">View page ↗</a></h1>' + flashHtml() +
      '<div class="notice"><p>Edit the homepage here, then click <b>Update</b> to publish to the live prototype. Text fields have English, Portuguese and French versions: switch with the language tabs. Empty translations fall back to English. Opportunities, intelligence, suppliers, news and webinars on the homepage come from their own content lists.</p></div>' +
      '<form class="he" data-f="home" data-cur="' + l + '"><div class="edit-layout"><div>' +
      '<div class="lang-tabs he-tabs">' + tabs + '</div>' + heroBox + d.sections.map(secFields).join('') + '</div>' +
      '<div class="he-side"><div class="postbox"><h2 class="hndle">Publish</h2><div class="inside"><p style="margin-top:0">Status: <b>Published</b></p><p>Last updated: ' + (d.updated ? fdt(d.updated) + '<br>by ' + esc(d.updatedBy || '') : 'never (default content)') + '</p><p id="he-dirty" style="' + (HE.dirty ? '' : 'display:none') + '"><span class="pill amber">Unsaved changes</span></p>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #dcdcde;padding-top:10px;margin-top:10px"><a href="#" style="color:#b32d2e" data-a="he-reset">Restore default content</a><button class="button button-primary">Update</button></div></div></div>' +
      '<div class="postbox"><h2 class="hndle">Sections <span style="font-weight:400;color:#646970;font-size:12px">order & visibility</span></h2><div class="inside">' + secRows + '<p class="desc" style="color:#646970;margin:8px 0 0">Untick to hide a section. Arrows change the order.</p></div></div>' +
      '<div class="postbox"><h2 class="hndle">Translation</h2><div class="inside"><p style="margin-top:0">' + I18N.langs.filter(function (x) { return x !== 'en'; }).map(function (x) { var n = emptyCount(d, x); return I18N.meta[x].label + ': ' + (n ? '<span class="pill amber">' + n + ' empty</span>' : '<span class="pill green">complete</span>'); }).join('<br>') + '</p><button type="button" class="button" data-a="he-mt">Fill empty PT/FR from English</button><div class="desc" style="color:#646970;margin-top:4px">Machine translation draft (simulated, via WPML Advanced Translation Editor in production). Review before publishing.</div></div></div></div></div>' +
      '<div class="postbox"><h2 class="hndle"><span>Live preview <span style="font-weight:400;color:#646970;font-size:12px">published version · updates after you click Update</span></span><span class="he-prev-tools">' + I18N.langs.map(function (x) { return '<button type="button" class="button button-small' + (x === l ? ' button-primary' : '') + '" data-a="he-lang" data-lang="' + x + '">' + x.toUpperCase() + '</button>'; }).join('') + ' <button type="button" class="button button-small' + (HE.device === 'desktop' ? ' button-primary' : '') + '" data-a="he-device" data-v="desktop">🖥 Desktop</button><button type="button" class="button button-small' + (HE.device === 'mobile' ? ' button-primary' : '') + '" data-a="he-device" data-v="mobile">📱 Mobile</button></span></h2>' +
      '<div class="inside"><div class="he-prev ' + HE.device + '" id="he-prev"><iframe id="he-frame" title="Homepage preview" src="index.html?embed=1#/' + l + '/"></iframe></div></div></div></form>';
  }
  function heFit() {
    var w = document.getElementById('he-prev'), f = document.getElementById('he-frame'); if (!w || !f) return;
    if (HE.device === 'mobile') { f.style.width = '390px'; f.style.height = '760px'; f.style.transform = 'none'; w.style.height = '760px'; return; }
    var s = Math.min(1, w.clientWidth / 1366); f.style.width = '1366px'; f.style.height = Math.round(760 / s) + 'px'; f.style.transform = 'scale(' + s + ')'; w.style.height = '760px';
  }
  function heCollect() {
    var d = clone(HE.draft);
    document.querySelectorAll('form.he [data-p]').forEach(function (el) {
      if (el.type === 'radio' && !el.checked) return;
      var v = el.type === 'checkbox' ? el.checked : el.value.trim(); if (el.getAttribute('data-num')) v = +v;
      var path = el.getAttribute('data-p').split('.'), l = el.getAttribute('data-l'), o = d;
      for (var i = 0; i < path.length - 1; i++) o = o[/^\d+$/.test(path[i]) ? +path[i] : path[i]];
      var last = path[path.length - 1];
      if (l) { if (!o[last] || typeof o[last] !== 'object') o[last] = {}; o[last][l] = v; } else o[last] = v;
    });
    var picks = {}; document.querySelectorAll('form.he [data-pick]').forEach(function (c) { var i = c.getAttribute('data-pick'); picks[i] = picks[i] || []; if (c.checked) picks[i].push(c.value); });
    Object.keys(picks).forEach(function (i) { d.sections[+i].pick = picks[i]; });
    return d;
  }
  function heRerender(keepScroll) { var y = window.scrollY; HE.keep = true; render(); if (keepScroll !== false) window.scrollTo(0, y); }
  function heMarkDirty() { HE.dirty = true; var el = document.getElementById('he-dirty'); if (el) el.style.display = ''; }

  /* ---------------- router ---------------- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, ''), qs = '', i = h.indexOf('?'); if (i >= 0) { qs = h.slice(i + 1); h = h.slice(0, i); }
    var q = {}; qs.split('&').filter(Boolean).forEach(function (p) { var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); });
    R.parts = h.split('/').filter(Boolean); if (!R.parts.length) R.parts = ['dashboard']; R.q = q;
  }
  function render() {
    parse();
    if (!me()) { loginView(); return; }
    var p = R.parts, a = p[0], html;
    if (a === 'dashboard') html = dashboard();
    else if (a === 'list') html = list(p[1]);
    else if (a === 'edit') html = edit(p[1], p[2]);
    else if (a === 'new') html = edit(p[1], null);
    else if (a === 'sync' && p[1] === 'queue') html = queueView();
    else if (a === 'sync' && p[1] === 'logs') html = logsView();
    else if (a === 'sync' && p[1] === 'source') html = syncSource(p[2]);
    else if (a === 'sync') html = syncSources();
    else if (a === 'members') html = members();
    else if (a === 'plans') html = plansView();
    else if (a === 'subs') html = subsView();
    else if (a === 'txns') html = txnsView();
    else if (a === 'payments') html = paymentsView();
    else if (a === 'regs') html = regsView();
    else if (a === 'enquiries') html = enquiries();
    else if (a === 'media') html = media();
    else if (a === 'pages' && p[1] === 'home') html = homeEditor();
    else if (a === 'pages') html = pages();
    else if (a === 'wpml' && p[1] === 'translations') html = translations();
    else if (a === 'wpml') html = wpml();
    else if (a === 'strings') html = strings();
    else if (a === 'users') html = usersView();
    else if (a === 'mail') html = mailView();
    else if (a === 'settings') html = settings();
    else html = dashboard();
    frame(html);
    if (a === 'pages' && p[1] === 'home') heFit();
    document.title = (root.querySelector('h1') ? root.querySelector('h1').childNodes[0].textContent.trim() + ' ‹ ' : '') + 'OilSkill ‹ WordPress (prototype)';
  }
  window.addEventListener('hashchange', render);

  /* ---------------- actions ---------------- */
  function subById(id) { return Store.get('subs', []).filter(function (s) { return s.id === id; })[0]; }
  function mailUser(uid, key, vars) { var u = Store.user(uid); if (u) Store.mail(u.email, key, u.lang || 'en', vars); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b || b.tagName === 'SELECT') return;
    var a = b.getAttribute('data-a');
    if (a === 'logout') { e.preventDefault(); Store.set('adminSession', null); render(); }
    else if (a === 'trash' || a === 'restore') { e.preventDefault(); var t = b.getAttribute('data-t'); Repo.save(t, { id: b.getAttribute('data-id'), status: a === 'trash' ? 'trash' : 'publish' }); flash(a === 'trash' ? '1 item moved to the Trash.' : '1 item restored.'); location.hash = '#/list/' + t; render(); }
    else if (a === 'run') { runAnimated([b.getAttribute('data-s')], 'manual'); }
    else if (a === 'run-all') { runAnimated(Sync.sources.map(function (s) { return s.id; }), 'cron (simulated)'); }
    else if (a === 'approve') { var it = Sync.approve(b.getAttribute('data-q'), { translate: !!b.getAttribute('data-tr') }); flash('Approved and published: <b>' + esc(L(it.title)) + '</b>. <a href="' + siteUrl(TYPES[Store.get('queue', []).filter(function (x) { return x.publishedId === it.id; })[0].type].site + '/' + it.id) + '" target="_blank">View on site ↗</a>'); render(); }
    else if (a === 'bulk-approve') { var n = 0; Store.get('queue', []).filter(function (x) { return x.status === 'pending'; }).forEach(function (x) { Sync.approve(x.qid, { translate: !!b.getAttribute('data-tr') }); n++; }); flash(n + ' item(s) approved and published.'); render(); }
    else if (a === 'reject') { Sync.reject(b.getAttribute('data-q')); flash('Item rejected. It will be skipped on future runs.', 'warning'); render(); }
    else if (a === 'qedit') {
      var qid = b.getAttribute('data-q'), qi = Store.get('queue', []).filter(function (x) { return x.qid === qid; })[0], m = qi.mapped;
      var bg = document.createElement('div'); bg.className = 'modal-bg';
      bg.innerHTML = '<form class="modal" data-f="qedit" data-q="' + qid + '"><h2 style="margin-top:0">Edit mapping before approval</h2><div class="acf-field"><label>Title</label><input type="text" name="title" value="' + esc(m.title) + '" style="width:100%"></div><div class="acf-field"><label>Summary</label><textarea name="summary" rows="3">' + esc(m.summary) + '</textarea></div><div class="acf-row"><div class="acf-field"><label>Sector</label><select name="sector">' + opts('sector', m.sector) + '</select></div><div class="acf-field"><label>Location</label><select name="loc">' + opts('location', m.loc) + '</select></div></div>' + (qi.type === 'opp' ? '<div class="acf-field"><label>Closing date</label><input type="date" name="close" value="' + (m.close || '').slice(0, 10) + '"></div>' : '') + '<div class="acts"><button type="button" class="button" data-a="mclose">Cancel</button><button class="button button-primary">Save & approve</button></div></form>';
      document.body.appendChild(bg);
    }
    else if (a === 'mclose') { b.closest('.modal-bg').remove(); }
    else if (a === 'showlog') { e.preventDefault(); var r = document.getElementById('log-' + b.getAttribute('data-l')); r.style.display = r.style.display === 'none' ? '' : 'none'; }
    else if (a === 'renew') { var s = subById(b.getAttribute('data-s')), p = plan(s.plan), ref = 'PF-SBX-' + Math.floor(100000 + Math.random() * 899999); s.renews = Store.addDays(s.renews || new Date(), p.cycle === 'month' ? 30 : 365); Store.saveSub(s); Store.push('txns', { id: ref, user: s.user, plan: s.plan, amount: p.price, status: 'complete', type: 'renewal', date: Store.now(), note: 'Recurring ITN (simulated)' }); mailUser(s.user, 'mail.renewal', { amount: money(p.price), d: fd(s.renews) }); flash('Renewal payment ' + ref + ' recorded. Access extended to ' + fd(s.renews) + '. Member emailed.'); render(); }
    else if (a === 'renewfail') { var s2 = subById(b.getAttribute('data-s')), p2 = plan(s2.plan); Store.push('txns', { id: 'PF-SBX-' + Math.floor(100000 + Math.random() * 899999), user: s2.user, plan: s2.plan, amount: p2.price, status: 'failed', type: 'renewal', date: Store.now(), note: 'Recurring charge declined (simulated)' }); s2.status = 'pending'; s2.renews = null; Store.saveSub(s2); mailUser(s2.user, 'mail.failed', { plan: L(p2.name) }); flash('Renewal failed: membership set to pending, premium access removed, member emailed.', 'warning'); render(); }
    else if (a === 'cancel') { var s3 = subById(b.getAttribute('data-s')); s3.status = 'cancelled'; s3.expires = s3.renews; s3.renews = null; Store.saveSub(s3); mailUser(s3.user, 'mail.cancel', { d: fd(s3.expires) }); flash('Subscription cancelled at gateway. Access continues until ' + fd(s3.expires) + '.'); render(); }
    else if (a === 'expire') { var s4 = subById(b.getAttribute('data-s')); s4.status = 'expired'; s4.expires = Store.now(); Store.saveSub(s4); mailUser(s4.user, 'mail.expired', {}); flash('Expiry job run (time-shifted): membership expired and premium access removed.'); render(); }
    else if (a === 'reactivate') { var s5 = subById(b.getAttribute('data-s')), p5 = plan(s5.plan); s5.status = 'active'; s5.start = Store.now(); s5.expires = null; s5.renews = Store.addDays(new Date(), p5.cycle === 'month' ? 30 : 365); Store.saveSub(s5); flash('Membership manually activated.'); render(); }
    else if (a === 'refund') { var tx = Store.get('txns', []); tx.forEach(function (x) { if (x.id === b.getAttribute('data-x')) x.status = 'refunded'; }); Store.set('txns', tx); flash('Transaction marked as refunded.'); render(); }
    else if (a === 'csv') {
      var rows = [['Name', 'Email', 'Organisation', 'Webinar', 'Language', 'Registered']].concat(Store.get('regs', []).map(function (r) { var w = Repo.get('webinar', r.webinar); return [r.name, r.email, r.org || '', w ? L(w.title) : r.webinar, r.lang, r.date]; }));
      var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var blob = new Blob(['﻿' + csv], { type: 'text/csv' }), link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'oilskill-webinar-registrations.csv'; link.click();
    }
    else if (a === 'savestr') { var k = b.getAttribute('data-k'), ov = Store.get('strings', {}); ['pt', 'fr'].forEach(function (l) { var ta = document.querySelector('textarea[data-k="' + k + '"][data-l="' + l + '"]'); ov[l] = ov[l] || {}; if (ta.value.trim() && ta.value.trim() !== I18N.raw(k, l)) ov[l][k] = ta.value.trim(); else delete ov[l][k]; }); Store.set('strings', ov); toast('String saved: ' + k); }
    else if (a === 'mt') { var f = document.querySelector('form[data-f="edit"]'), l = b.getAttribute('data-lang'), item = Repo.get(f.getAttribute('data-type'), f.getAttribute('data-id')); f.elements.title.value = '[' + l.toUpperCase() + ' MT] ' + L(item.title); f.elements.text.value = '[' + l.toUpperCase() + ' MT] ' + L(item.summary || item.desc); toast('Machine translation draft inserted (simulated). Review, then Update.'); }
    else if (a === 'reset') { if (confirm('Reset all demo data?')) { Store.reset(); Store.set('adminSession', 'u_admin'); flash('Demo data reset.'); location.hash = '#/dashboard'; render(); } }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-a="feedver"]')) { var st = Store.get('sourceState', {}); st.s3 = e.target.value; Store.set('sourceState', st); toast('Test feed set to ' + e.target.value + '. Click “Run now”.'); render(); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target, k = f.getAttribute('data-f'); if (!k) return; e.preventDefault();
    if (k === 'login') {
      var u = Store.userByEmail(f.elements.u.value);
      if (!u || u.password !== f.elements.p.value || (u.role !== 'administrator' && u.role !== 'editor')) { loginView(true); return; }
      Store.set('adminSession', u.id); location.hash = '#/dashboard'; render();
    }
    else if (k === 'listfilter') { location.hash = '#/list/' + f.getAttribute('data-type') + '?s=' + encodeURIComponent(f.elements.s.value) + '&sector=' + f.elements.sector.value + (R.q.status ? '&status=' + R.q.status : ''); }
    else if (k === 'regfilter') { location.hash = '#/regs?w=' + f.elements.w.value; }
    else if (k === 'strsearch') { location.hash = '#/strings?s=' + encodeURIComponent(f.elements.s.value); }
    else if (k === 'qedit') {
      var qid = f.getAttribute('data-q'), queue = Store.get('queue', []), qi = queue.filter(function (x) { return x.qid === qid; })[0];
      Object.assign(qi.mapped, { title: f.elements.title.value, summary: f.elements.summary.value, sector: f.elements.sector.value, loc: f.elements.loc.value });
      if (f.elements.close && f.elements.close.value) qi.mapped.close = new Date(f.elements.close.value + 'T17:00:00').toISOString();
      Store.set('queue', queue); f.closest('.modal-bg').remove(); var it = Sync.approve(qid, {}); flash('Edited and published: <b>' + esc(L(it.title)) + '</b>'); render();
    }
    else if (k === 'edit') {
      var type = f.getAttribute('data-type'), id = f.getAttribute('data-id'), lang = f.getAttribute('data-lang'), isNew = f.getAttribute('data-new') === '1';
      var cur = isNew ? { id: id, title: {}, summary: {}, sample: false } : Repo.get(type, id);
      var el = f.elements, val = function (n) { return el[n] ? el[n].value : undefined; };
      if (!el.title.value.trim()) { toast('Title is required'); el.title.focus(); return; }
      var upd = { id: id, status: val('status'), premium: el.premium.checked, sector: val('sector'), loc: val('loc') };
      if (type === 'supplier') {
        upd.name = el.title.value.trim(); upd.overview = Object.assign({}, cur.overview || {}); upd.overview[lang] = el.text.value;
        upd.services = Array.prototype.filter.call(f.querySelectorAll('[name=svc]'), function (c) { return c.checked; }).map(function (c) { return c.value; });
        upd.city = val('city'); upd.certs = val('certs').split(',').map(function (s) { return s.trim(); }).filter(Boolean); upd.founded = val('founded'); upd.staff = val('staff'); upd.featured = el.featured.checked;
        if (isNew) { upd.color = '#3B2F6B'; upd.local = true; }
      } else {
        upd.title = Object.assign({}, cur.title || {}); upd.title[lang] = el.title.value.trim();
        var tf = type === 'opp' ? 'desc' : 'summary'; upd[tf] = Object.assign({}, cur[tf] || cur.summary || {}); upd[tf][lang] = el.text.value;
        if (type === 'opp') { upd.summary = upd.desc; upd.type = val('type'); upd.org = val('org'); if (val('date')) upd.date = new Date(val('date') + 'T08:00:00Z').toISOString(); if (val('close')) upd.close = new Date(val('close') + 'T15:00:00Z').toISOString(); }
        if (type === 'intel') { upd.cat = val('cat'); upd.type = val('type'); if (isNew) { upd.points = []; upd.date = Store.now(); upd.img = 'hero'; } }
        if (type === 'news') { upd.cat = val('cat'); if (isNew) { upd.date = Store.now(); upd.img = 'pemba'; } }
        if (type === 'webinar') { upd.platform = val('platform'); upd.mode = val('mode'); upd.url = val('url'); upd.recording = val('recording'); var sd = val('start') ? new Date(val('start') + ':00+02:00') : null; if (sd && !isNaN(sd)) upd.start = sd.toISOString(); else if (isNew) upd.start = Store.addDays(new Date(), 14); if (isNew) { upd.speakers = []; upd.img = 'people'; upd.cat = 'sector'; } }
        if (lang !== 'en' && /^\[(PT|FR) MT\]/.test(upd.title[lang])) upd.mt = true;
      }
      Repo.save(type, upd);
      flash((isNew ? 'Item published.' : 'Item updated (' + I18N.meta[lang].label + ').') + ' <a href="' + siteUrl(TYPES[type].site + '/' + id).replace('#/en/', '#/' + lang + '/') + '" target="_blank">View on site ↗</a>');
      location.hash = '#/edit/' + type + '/' + id + '?lang=' + lang; render();
    }
  });

  /* ---------------- Home editor events ---------------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a^="he-"]'); if (!b) return;
    e.preventDefault();
    var a = b.getAttribute('data-a'), d;
    if (a === 'he-lang') {
      HE.lang = b.getAttribute('data-lang'); var f = document.querySelector('form.he');
      if (f) f.setAttribute('data-cur', HE.lang);
      document.querySelectorAll('.he-tabs a').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-lang') === HE.lang); });
      document.querySelectorAll('.he-prev-tools [data-a="he-lang"]').forEach(function (x) { x.classList.toggle('button-primary', x.getAttribute('data-lang') === HE.lang); });
      var fr = document.getElementById('he-frame'); if (fr) fr.contentWindow.location.hash = '#/' + HE.lang + '/';
      var vp = document.querySelector('h1 .page-title-action'); if (vp) vp.setAttribute('href', 'index.html#/' + HE.lang + '/');
    }
    else if (a === 'he-device') { HE.device = b.getAttribute('data-v'); HE.draft = heCollect(); heRerender(); }
    else if (a === 'he-jump') { var t = document.getElementById('he-sec-' + b.getAttribute('data-id')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (a === 'he-move') { d = heCollect(); var i = +b.getAttribute('data-i'), j = i + +b.getAttribute('data-d'); var tmp = d.sections[i]; d.sections[i] = d.sections[j]; d.sections[j] = tmp; HE.draft = d; HE.dirty = true; heRerender(); }
    else if (a === 'he-pmove') { d = heCollect(); var pi = +b.getAttribute('data-i'), pj = pi + +b.getAttribute('data-d'); var pt = d.projects[pi]; d.projects[pi] = d.projects[pj]; d.projects[pj] = pt; HE.draft = d; HE.dirty = true; heRerender(); }
    else if (a === 'he-pdel') { if (!confirm('Remove this project card?')) return; d = heCollect(); d.projects.splice(+b.getAttribute('data-i'), 1); HE.draft = d; HE.dirty = true; heRerender(); }
    else if (a === 'he-padd') { d = heCollect(); d.projects.push({ name: 'New project', operator: '', loc: 'national', img: 'hero', text: { en: '', pt: '', fr: '' } }); HE.draft = d; HE.dirty = true; heRerender(); }
    else if (a === 'he-mt') {
      d = heCollect(); var n = 0;
      triWalk(d, function (o) { ['pt', 'fr'].forEach(function (l) { if (o.en && !o[l]) { o[l] = '[' + l.toUpperCase() + ' MT] ' + o.en; n++; } }); });
      HE.draft = d; if (n) HE.dirty = true; heRerender();
      toast(n ? n + ' empty field(s) filled with a machine-translation draft. Review, then Update.' : 'No empty translations.');
    }
    else if (a === 'he-reset') { if (!confirm('Restore the default homepage content? Your saved changes will be lost.')) return; HomeCfg.reset(); HE.draft = null; HE.dirty = false; flash('Default homepage content restored.'); render(); }
  });
  document.addEventListener('input', function (e) { if (e.target.closest && e.target.closest('form.he')) heMarkDirty(); });
  document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('form.he')) heMarkDirty(); });
  document.addEventListener('submit', function (e) {
    var f = e.target; if (f.getAttribute('data-f') !== 'home') return;
    e.preventDefault(); e.stopImmediatePropagation();
    var d = heCollect();
    if (!d.hero.title.en) {
      HE.lang = 'en'; f.setAttribute('data-cur', 'en');
      f.querySelector('[data-p="hero.title"][data-l="en"]').focus();
      toast('Main heading (English) is required.'); return;
    }
    var u = me(); d.updated = Store.now(); d.updatedBy = u.first + ' ' + u.last;
    HomeCfg.save(d); HE.draft = d; HE.dirty = false;
    flash('Home page updated and published. <a href="index.html#/' + HE.lang + '/" target="_blank">View page ↗</a>');
    heRerender(false);
  }, true);
  window.addEventListener('resize', heFit);
  window.addEventListener('beforeunload', function (e) { if (HE.dirty && document.querySelector('form.he')) { e.preventDefault(); e.returnValue = ''; } });

  render();
})();
