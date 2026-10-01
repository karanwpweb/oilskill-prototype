/* OilSkill prototype – shared state (simulates the WordPress database).
   Both index.html (site) and admin.html (WP admin mock) read/write the same
   browser storage, so actions in one are reflected in the other. */
(function () {
  var mem = {};
  var PREFIX = 'oilskill_demo_v1_';

  function rawGet(k) {
    try { var v = localStorage.getItem(PREFIX + k); return v === null ? undefined : JSON.parse(v); }
    catch (e) { return mem[k]; }
  }
  function rawSet(k, v) {
    mem[k] = v;
    try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* private mode: memory only */ }
  }

  var Store = {
    get: function (k, def) { var v = rawGet(k); return v === undefined ? (def === undefined ? null : def) : v; },
    set: rawSet,
    push: function (k, item) { var a = Store.get(k, []); a.unshift(item); rawSet(k, a); return item; },
    uid: function (p) { return (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    now: function () { return new Date().toISOString(); },
    reset: function () {
      try {
        Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PREFIX) === 0) localStorage.removeItem(k); });
      } catch (e) {}
      mem = {};
      Store.seed();
    }
  };

  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString(); }
  Store.addDays = addDays;

  /* ---------- Seed demo users, subscriptions and transactions ---------- */
  Store.seed = function () {
    if (Store.get('seeded')) return;
    var today = new Date();
    var users = [
      { id: 'u_admin', role: 'administrator', first: 'Demo', last: 'Administrator', email: 'admin@oilskill-demo.test', password: 'Admin@2026', org: 'OilSkill Co.', job: 'Platform Administrator', country: 'Mozambique', lang: 'en', created: addDays(today, -120) },
      { id: 'u_editor', role: 'editor', first: 'Demo', last: 'Editor', email: 'editor@oilskill-demo.test', password: 'Editor@2026', org: 'OilSkill Co.', job: 'Content & Data Reviewer', country: 'Mozambique', lang: 'pt', created: addDays(today, -90) },
      { id: 'u_free', role: 'subscriber', first: 'Ana', last: 'Machava (sample)', email: 'free@oilskill-demo.test', password: 'Member@2026', org: 'Sample Engineering Lda', job: 'Procurement Officer', country: 'Mozambique', lang: 'pt', created: addDays(today, -40) },
      { id: 'u_pro', role: 'subscriber', first: 'David', last: 'Mussa (sample)', email: 'pro@oilskill-demo.test', password: 'Member@2026', org: 'Sample Logistics SA', job: 'Business Development Manager', country: 'Mozambique', lang: 'en', created: addDays(today, -75) },
      { id: 'u_cancel', role: 'subscriber', first: 'Claire', last: 'Dubois (sample)', email: 'cancelled@oilskill-demo.test', password: 'Member@2026', org: 'Sample Consulting SARL', job: 'Analyst', country: 'France', lang: 'fr', created: addDays(today, -60) },
      { id: 'u_expired', role: 'subscriber', first: 'João', last: 'Sitoe (sample)', email: 'expired@oilskill-demo.test', password: 'Member@2026', org: 'Sample Services Lda', job: 'Engineer', country: 'Mozambique', lang: 'pt', created: addDays(today, -400) },
      { id: 'u_corp', role: 'subscriber', first: 'Sarah', last: 'Naidoo (sample)', email: 'corporate@oilskill-demo.test', password: 'Member@2026', org: 'Sample Marine Services (Pty) Ltd', job: 'Commercial Director', country: 'South Africa', lang: 'en', created: addDays(today, -200) },
      { id: 'u_failed', role: 'subscriber', first: 'Pedro', last: 'Cossa (sample)', email: 'failed@oilskill-demo.test', password: 'Member@2026', org: 'Sample HSE Training', job: 'Director', country: 'Mozambique', lang: 'pt', created: addDays(today, -3) }
    ];
    var subs = [
      { id: 's_pro', user: 'u_pro', plan: 'pro_monthly', status: 'active', start: addDays(today, -75), renews: addDays(today, 15), expires: null, gatewayRef: 'PF-SBX-TOKEN-7F31A' },
      { id: 's_cancel', user: 'u_cancel', plan: 'pro_annual', status: 'cancelled', start: addDays(today, -330), renews: null, expires: addDays(today, 35), gatewayRef: 'PF-SBX-TOKEN-29C0D' },
      { id: 's_expired', user: 'u_expired', plan: 'pro_annual', status: 'expired', start: addDays(today, -400), renews: null, expires: addDays(today, -35), gatewayRef: 'PF-SBX-TOKEN-11B8E' },
      { id: 's_corp', user: 'u_corp', plan: 'corporate', status: 'active', start: addDays(today, -200), renews: addDays(today, 165), expires: null, gatewayRef: 'PF-SBX-TOKEN-88E4F' },
      { id: 's_failed', user: 'u_failed', plan: 'pro_monthly', status: 'pending', start: addDays(today, -3), renews: null, expires: null, gatewayRef: null }
    ];
    var txns = [
      { id: 'PF-SBX-100481', user: 'u_pro', plan: 'pro_monthly', amount: 250, status: 'complete', type: 'initial', date: addDays(today, -75) },
      { id: 'PF-SBX-100733', user: 'u_pro', plan: 'pro_monthly', amount: 250, status: 'complete', type: 'renewal', date: addDays(today, -45) },
      { id: 'PF-SBX-101002', user: 'u_pro', plan: 'pro_monthly', amount: 250, status: 'complete', type: 'renewal', date: addDays(today, -15) },
      { id: 'PF-SBX-099120', user: 'u_cancel', plan: 'pro_annual', amount: 2500, status: 'complete', type: 'initial', date: addDays(today, -330) },
      { id: 'PF-SBX-087455', user: 'u_expired', plan: 'pro_annual', amount: 2500, status: 'complete', type: 'initial', date: addDays(today, -400) },
      { id: 'PF-SBX-095310', user: 'u_corp', plan: 'corporate', amount: 7500, status: 'complete', type: 'initial', date: addDays(today, -200) },
      { id: 'PF-SBX-101377', user: 'u_failed', plan: 'pro_monthly', amount: 250, status: 'failed', type: 'initial', date: addDays(today, -3), note: 'Card declined (sandbox)' }
    ];
    rawSet('users', users);
    rawSet('subs', subs);
    rawSet('txns', txns);
    rawSet('content', {});      /* edits/overrides & imported items: { type: { id: item } } */
    rawSet('queue', []);        /* imported items awaiting review */
    rawSet('rejected', []);     /* fingerprints of rejected imports */
    rawSet('synclog', []);
    rawSet('regs', [
      { id: 'r1', webinar: 'w1', name: 'Ana Machava (sample)', email: 'free@oilskill-demo.test', org: 'Sample Engineering Lda', lang: 'pt', date: addDays(today, -2) },
      { id: 'r2', webinar: 'w1', name: 'David Mussa (sample)', email: 'pro@oilskill-demo.test', org: 'Sample Logistics SA', lang: 'en', date: addDays(today, -1) },
      { id: 'r3', webinar: 'w2', name: 'Claire Dubois (sample)', email: 'cancelled@oilskill-demo.test', org: 'Sample Consulting SARL', lang: 'fr', date: addDays(today, -1) }
    ]);
    rawSet('contacts', []);
    rawSet('mail', []);
    rawSet('strings', {});      /* String Translation overrides: { lang: { key: value } } */
    rawSet('sourceState', { s3: 'v1' });
    rawSet('session', null);
    rawSet('adminSession', null);
    rawSet('seeded', Store.now());
  };

  /* ---------- Helpers used by both apps ---------- */
  Store.users = function () { return Store.get('users', []); };
  Store.user = function (id) { return Store.users().filter(function (u) { return u.id === id; })[0] || null; };
  Store.userByEmail = function (e) { e = (e || '').trim().toLowerCase(); return Store.users().filter(function (u) { return u.email.toLowerCase() === e; })[0] || null; };
  Store.saveUser = function (u) {
    var a = Store.users(), i = a.findIndex(function (x) { return x.id === u.id; });
    if (i >= 0) a[i] = u; else a.unshift(u);
    rawSet('users', a);
  };
  Store.subFor = function (userId) {
    return Store.get('subs', []).filter(function (s) { return s.user === userId; })[0] || null;
  };
  Store.saveSub = function (s) {
    var a = Store.get('subs', []), i = a.findIndex(function (x) { return x.id === s.id; });
    if (i >= 0) a[i] = s; else a.unshift(s);
    rawSet('subs', a);
  };
  /* Effective access: active, or cancelled but still inside the paid period */
  Store.accessLevel = function (userId) {
    if (!userId) return 'visitor';
    var u = Store.user(userId); if (!u) return 'visitor';
    if (u.role === 'administrator' || u.role === 'editor') return 'premium';
    var s = Store.subFor(userId);
    if (!s) return 'free';
    if (s.status === 'cancelled' && s.expires && new Date(s.expires) < new Date()) { s.status = 'expired'; Store.saveSub(s); }
    if (s.status === 'active' || s.status === 'cancelled') return 'premium';
    return 'free';
  };
  Store.mail = function (to, subjectKey, lang, vars) {
    Store.push('mail', { id: Store.uid('m'), to: to, subjectKey: subjectKey, lang: lang, vars: vars || {}, date: Store.now() });
  };

  window.Store = Store;
  Store.seed();
})();
