/* OilSkill prototype – data extraction & synchronisation engine.
   WORKING in the browser: RSS/XML parsing, HTML scraping with CSS selectors, JSON parsing,
   field mapping, sector/location classification, duplicate detection, update detection,
   validation, error logging and an admin review/approval queue.
   SIMULATED: network fetch (sources are bundled snapshots, because browsers block
   cross-site requests). In production this runs server-side in a WordPress plugin on a
   daily cron, fetching the agreed live sources. */
(function () {
  var RSS_A = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n<title>Sample Energy News Feed</title>\n<link>https://source-a.example.test/energy</link>\n' +
    '<item><guid>SA-2026-0912</guid><title>Sample feed item: LNG contractors outline supplier registration windows for Cabo Delgado works</title><link>https://source-a.example.test/energy/sa-2026-0912</link><pubDate>{D-1}</pubDate><category>LNG</category><description>Sample summary imported from RSS. Contractors working near Palma describe how and when local suppliers can register for upcoming packages.</description></item>\n' +
    '<item><guid>SA-2026-0915</guid><title>Sample feed item: Port of Pemba logistics expansion to support offshore operations</title><link>https://source-a.example.test/energy/sa-2026-0915</link><pubDate>{D-2}</pubDate><category>Logistics</category><description>Sample summary imported from RSS. New laydown and warehouse capacity planned at Pemba port.</description></item>\n' +
    '<item><guid>SA-2026-0917</guid><title>Sample feed item: Training centre in Maputo launches welding and instrumentation courses</title><link>https://source-a.example.test/energy/sa-2026-0917</link><pubDate>{D-3}</pubDate><category>Skills</category><description>Sample summary imported from RSS. Certified technical courses aimed at gas-sector employment.</description></item>\n' +
    '<item><guid>SA-2026-0915</guid><title>Sample feed item: Port of Pemba logistics expansion to support offshore operations</title><link>https://source-a.example.test/energy/sa-2026-0915</link><pubDate>{D-2}</pubDate><category>Logistics</category><description>Repeated entry inside the same feed (tests in-feed duplicate detection).</description></item>\n' +
    '<item><guid>SA-2026-0919</guid><title></title><link>https://source-a.example.test/energy/sa-2026-0919</link><pubDate>{D-4}</pubDate><description>Item with an empty title (tests validation of required fields).</description></item>\n' +
    '<item><guid>SA-2026-0921</guid><title>Sample feed item: Inhambane gas pipeline maintenance campaign scheduled</title><link>https://source-a.example.test/energy/sa-2026-0921</link><pubDate>{D-5}</pubDate><category>Pipelines</category><description>Sample summary imported from RSS. Inspection and maintenance works planned on onshore gas infrastructure near Temane.</description></item>\n' +
    '</channel></rss>';

  var HTML_B = '<html><body><h1>Procurement notices (sample snapshot)</h1><table class="tenders"><thead><tr><th>Ref</th><th>Title</th><th>Organisation</th><th>Location</th><th>Closing</th></tr></thead><tbody>' +
    '<tr><td class="ref">PN-0457</td><td class="title"><a href="/notices/pn-0457">Supply of fuel storage tanks for a district power station</a></td><td class="org">Sample Public Utility</td><td class="loc">Inhambane</td><td class="closing">{F20}</td></tr>' +
    '<tr><td class="ref">PN-0461</td><td class="title"><a href="/notices/pn-0461">Construction of a training workshop for technical trades</a></td><td class="org">Sample Training Authority</td><td class="loc">Maputo</td><td class="closing">{F30}</td></tr>' +
    '<tr><td class="ref">PN-0463</td><td class="title"><a href="/notices/pn-0463">Environmental monitoring services: coastal zone</a></td><td class="org">Sample Environment Agency</td><td class="loc">Pemba</td><td class="closing">not stated</td></tr>' +
    '<tr><td class="ref">PN-0466</td><td class="title"><a href="/notices/pn-0466">Road transport of oversized equipment, northern corridor</a></td><td class="org">Sample Roads Agency</td><td class="loc">Cabo Delgado</td><td class="closing">{F15}</td></tr>' +
    '</tbody></table></body></html>';

  var JSON_C = {
    v1: { items: [
      { id: 'TF-101', title: 'Test feed: Offshore LNG output update (sample)', summary: 'Version 1 summary of a production update for an offshore LNG facility.', url: 'https://test-feed.example.test/items/TF-101', published: '{D-2}', sector: 'LNG', location: 'Rovuma' },
      { id: 'TF-102', title: 'Test feed: Supplier certification statistics (sample)', summary: 'Version 1: share of registered suppliers holding ISO certifications.', url: 'https://test-feed.example.test/items/TF-102', published: '{D-3}', sector: 'HSE', location: 'Mozambique' },
      { id: 'TF-103', title: 'Test feed: Fuel import volumes, quarterly snapshot (sample)', summary: 'Version 1: quarterly fuel import volumes through Beira.', url: 'https://test-feed.example.test/items/TF-103', published: '{D-4}', sector: 'Fuel', location: 'Beira' }
    ] },
    v2: { items: [
      { id: 'TF-101', title: 'Test feed: Offshore LNG output update (sample)', summary: 'Version 1 summary of a production update for an offshore LNG facility.', url: 'https://test-feed.example.test/items/TF-101', published: '{D-2}', sector: 'LNG', location: 'Rovuma' },
      { id: 'TF-102', title: 'Test feed: Supplier certification statistics (sample, revised)', summary: 'Version 2 (REVISED AT SOURCE): figures corrected and a new chart added.', url: 'https://test-feed.example.test/items/TF-102', published: '{D-3}', sector: 'HSE', location: 'Mozambique' },
      { id: 'TF-103', title: 'Test feed: Fuel import volumes, quarterly snapshot (sample)', summary: 'Version 1: quarterly fuel import volumes through Beira.', url: 'https://test-feed.example.test/items/TF-103', published: '{D-4}', sector: 'Fuel', location: 'Beira' },
      { id: 'TF-104', title: 'Test feed: New skills programme for gas technicians (sample)', summary: 'Version 2: newly published item.', url: 'https://test-feed.example.test/items/TF-104', published: '{D-1}', sector: 'Skills', location: 'Maputo' }
    ] },
    broken: '{"items": [ {"id": "TF-101", "title": "Truncated response...'
  };

  /* Simulated machine-translation output (production: WPML Advanced Translation Editor / DeepL) */
  var MT = {
    'SA-2026-0912': { pt: 'Item de amostra: empreiteiros de GNL indicam prazos de registo de fornecedores para obras em Cabo Delgado', fr: 'Élément exemple : les entrepreneurs GNL précisent les périodes d’inscription des fournisseurs pour les travaux du Cabo Delgado' },
    'SA-2026-0915': { pt: 'Item de amostra: expansão logística do Porto de Pemba para apoiar operações offshore', fr: 'Élément exemple : extension logistique du port de Pemba en appui aux opérations offshore' },
    'SA-2026-0917': { pt: 'Item de amostra: centro de formação em Maputo lança cursos de soldadura e instrumentação', fr: 'Élément exemple : un centre de formation de Maputo lance des cours de soudage et d’instrumentation' },
    'SA-2026-0921': { pt: 'Item de amostra: campanha de manutenção de gasoduto em Inhambane agendada', fr: 'Élément exemple : campagne de maintenance d’un gazoduc programmée dans l’Inhambane' },
    'TF-101': { pt: 'Feed de teste: atualização da produção de GNL offshore (amostra)', fr: 'Flux de test : point sur la production de GNL offshore (exemple)' },
    'TF-102': { pt: 'Feed de teste: estatísticas de certificação de fornecedores (amostra)', fr: 'Flux de test : statistiques de certification des fournisseurs (exemple)' },
    'TF-103': { pt: 'Feed de teste: volumes de importação de combustível, resumo trimestral (amostra)', fr: 'Flux de test : volumes d’importation de carburant, point trimestriel (exemple)' },
    'TF-104': { pt: 'Feed de teste: novo programa de competências para técnicos de gás (amostra)', fr: 'Flux de test : nouveau programme de compétences pour techniciens gaziers (exemple)' }
  };

  var SOURCES = [
    { id: 's1', name: 'Source A: Public energy news RSS feed', standIn: 'Stand-in for an agreed public feed, e.g. Club of Mozambique energy RSS or INP news', type: 'RSS / XML', url: 'https://source-a.example.test/energy/rss', target: 'news', targetCat: 'industry', mode: 'review', schedule: 'Daily, 02:00 CAT',
      map: [['item > title', 'Title'], ['item > description', 'Summary'], ['item > link', 'Source URL'], ['item > guid', 'External ID'], ['item > pubDate', 'Publication date'], ['item > category + keywords', 'Industry sector (rule-based)'], ['keywords in text', 'Location (rule-based)']] },
    { id: 's2', name: 'Source B: Public procurement notices page', standIn: 'Stand-in for an agreed public tenders page, e.g. INP / ENH procurement notices', type: 'HTML scrape', url: 'https://source-b.example.test/procurement/notices', target: 'opp', mode: 'review', schedule: 'Daily, 02:30 CAT',
      selectors: { row: 'table.tenders tbody tr', title: 'td.title a', link: 'td.title a', ref: 'td.ref', org: 'td.org', loc: 'td.loc', closing: 'td.closing' },
      map: [['td.ref', 'External ID / reference'], ['td.title a (text)', 'Title'], ['td.title a (href)', 'Source URL'], ['td.org', 'Organisation'], ['td.loc', 'Location (normalised)'], ['td.closing', 'Closing date (validated)'], ['title keywords', 'Industry sector (rule-based)']] },
    { id: 's3', name: 'Source C: Demo Test Feed (controlled)', standIn: 'Controlled test source for demonstrating duplicate, update and error handling on demand', type: 'JSON API', url: 'https://test-feed.example.test/api/items', target: 'intel', mode: 'review', schedule: 'Daily, 03:00 CAT',
      map: [['items[].id', 'External ID'], ['items[].title', 'Title'], ['items[].summary', 'Summary'], ['items[].url', 'Source URL'], ['items[].published', 'Publication date'], ['items[].sector', 'Industry sector (mapped)'], ['items[].location', 'Location (mapped)']] }
  ];

  function dateFmt(n) { var x = new Date(); x.setDate(x.getDate() + n); return x; }
  function fill(str) {
    return str.replace(/\{D-(\d+)\}/g, function (_, n) { return dateFmt(-n).toUTCString(); })
      .replace(/\{F(\d+)\}/g, function (_, n) { return dateFmt(+n).toISOString().slice(0, 10); });
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return ('00000000' + (h >>> 0).toString(16)).slice(-8); }
  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

  var SECTOR_RULES = [
    [/\blng\b|gnl|liquefied/i, 'lng'], [/pipeline|gasoduto|midstream/i, 'midstream'], [/ports?|logistic|transport|road|haul|warehous/i, 'logistics'],
    [/fuel|combust|storage tank|downstream/i, 'downstream'], [/training|skills|course|welding|technician|workshop/i, 'local'],
    [/hse|environment|safety|certification|iso/i, 'hse'], [/drilling|exploration|upstream|block|reservoir/i, 'upstream'],
    [/construction|fabricat|engineering|steel/i, 'construction']
  ];
  var LOC_RULES = [
    [/pemba|palma|afungi|cabo delgado|mocimboa/i, 'cabo-delgado'], [/rovuma|offshore/i, 'rovuma'], [/inhambane|temane|pande|vilankulo/i, 'inhambane'],
    [/maputo|matola/i, 'maputo'], [/beira|sofala/i, 'sofala'], [/nacala|nampula/i, 'nampula']
  ];
  function classify(text, rules, def) { for (var i = 0; i < rules.length; i++) if (rules[i][0].test(text)) return rules[i][1]; return def; }

  /* ---- Parsers: genuinely parse the source formats ---- */
  function parseRSS(xml) {
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('XML parse error: feed is not well-formed');
    return Array.prototype.map.call(doc.querySelectorAll('item'), function (it) {
      var g = function (sel) { var n = it.querySelector(sel); return n ? n.textContent.trim() : ''; };
      return { externalId: g('guid'), title: g('title'), summary: g('description'), url: g('link'), date: g('pubDate'), category: g('category') };
    });
  }
  function parseHTML(html, sel) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var rows = doc.querySelectorAll(sel.row);
    if (!rows.length) throw new Error('Selector "' + sel.row + '" matched 0 rows: source layout may have changed');
    return Array.prototype.map.call(rows, function (r) {
      var q = function (s) { var n = r.querySelector(s); return n ? n.textContent.trim() : ''; };
      var a = r.querySelector(sel.link);
      return { externalId: q(sel.ref), title: q(sel.title), url: a ? 'https://source-b.example.test' + a.getAttribute('href') : '', org: q(sel.org), locText: q(sel.loc), closing: q(sel.closing) };
    });
  }
  function parseJSON(text) {
    var j;
    try { j = JSON.parse(text); } catch (e) { throw new Error('JSON parse error: ' + e.message); }
    if (!j || !Array.isArray(j.items)) throw new Error('Unexpected response: "items" array missing');
    return j.items.map(function (x) { return { externalId: x.id, title: x.title, summary: x.summary, url: x.url, date: x.published, category: x.sector, locText: x.location }; });
  }

  function fetchSnapshot(src) {
    if (src.id === 's1') return fill(RSS_A);
    if (src.id === 's2') return fill(HTML_B);
    var v = (Store.get('sourceState', {}).s3) || 'v1';
    if (v === 'broken') return JSON_C.broken;
    return fill(JSON.stringify(JSON_C[v]));
  }
  function rawPreview(src) { return fetchSnapshot(src); }

  /* Map a parsed record to the target WordPress content type */
  function mapRecord(src, r) {
    var text = [r.title, r.summary, r.category, r.locText].join(' ');
    var m = {
      title: r.title, summary: r.summary || '', sourceUrl: r.url, externalId: r.externalId,
      sector: classify(text, SECTOR_RULES, 'services'), loc: classify(text, LOC_RULES, 'national'),
      sourceName: src.name.replace(/^Source [A-C]: /, ''), sourceId: src.id
    };
    if (src.target === 'opp') {
      m.org = r.org; m.type = 'tender';
      var cd = /^\d{4}-\d{2}-\d{2}$/.test(r.closing) ? new Date(r.closing + 'T17:00:00').toISOString() : null;
      m.close = cd; m.closingRaw = r.closing; m.date = new Date().toISOString();
      if (!m.summary) m.summary = 'Procurement notice ' + r.externalId + ' published by ' + r.org + '. See the original notice for full requirements.';
    } else {
      var dt = new Date(r.date); m.date = isNaN(dt) ? new Date().toISOString() : dt.toISOString();
    }
    if (src.target === 'news') m.cat = 'industry';
    if (src.target === 'intel') { m.cat = 'market'; m.type = 'dataset'; }
    return m;
  }

  function fingerprint(m) { return m.externalId ? 'id:' + m.externalId : (m.sourceUrl ? 'url:' + m.sourceUrl : 'th:' + hash(norm(m.title) + m.date.slice(0, 10))); }
  function contentHash(m) { return hash([m.title, m.summary, m.close || '', m.org || ''].join('|')); }

  function findPublished(type, fp) {
    var c = (Store.get('content', {})[type]) || {};
    for (var k in c) if (c[k].syncFingerprint === fp && c[k].status !== 'trash') return c[k];
    return null;
  }

  function run(sourceId, trigger) {
    var src = SOURCES.filter(function (s) { return s.id === sourceId; })[0];
    var log = { id: Store.uid('log'), source: src.id, sourceName: src.name, trigger: trigger || 'manual', start: Store.now(), fetched: 0, created: 0, updated: 0, duplicates: 0, skipped: 0, errors: [], lines: [] };
    var queue = Store.get('queue', []), rejected = Store.get('rejected', []);
    function line(level, msg) { log.lines.push({ level: level, msg: msg }); }
    line('info', 'GET ' + src.url + ' (' + src.type + ')');
    try {
      var body = fetchSnapshot(src);
      line('info', 'HTTP 200 OK: ' + body.length + ' bytes received (bundled snapshot)');
      var recs = src.id === 's1' ? parseRSS(body) : src.id === 's2' ? parseHTML(body, src.selectors) : parseJSON(body);
      log.fetched = recs.length;
      line('info', 'Parsed ' + recs.length + ' records');
      var seenThisRun = {};
      recs.forEach(function (r, i) {
        var label = '#' + (i + 1) + ' ' + (r.externalId || '') + ' ';
        if (!r.title) { log.skipped++; log.errors.push('Record ' + (i + 1) + ' (' + (r.externalId || 'no id') + '): required field "title" is empty, skipped'); line('warn', label + 'SKIPPED: missing required field "title"'); return; }
        var m = mapRecord(src, r), fp = fingerprint(m), ch = contentHash(m);
        if (src.target === 'opp' && !m.close) line('warn', label + 'closing date "' + m.closingRaw + '" not a valid date: imported without deadline, flagged for review');
        if (seenThisRun[fp]) { log.duplicates++; line('dup', label + 'DUPLICATE within feed: skipped'); return; }
        seenThisRun[fp] = 1;
        if (rejected.indexOf(fp) >= 0) { log.skipped++; line('dup', label + 'previously REJECTED by reviewer: skipped'); return; }
        var pend = queue.filter(function (q) { return q.fingerprint === fp && q.status === 'pending'; })[0];
        if (pend) {
          if (pend.hash === ch) { log.duplicates++; line('dup', label + 'DUPLICATE: already awaiting review'); return; }
          pend.mapped = m; pend.hash = ch; pend.date = Store.now(); log.updated++; line('upd', label + 'UPDATED at source: pending review item refreshed'); return;
        }
        var pub = findPublished(src.target, fp);
        if (pub) {
          if (pub.syncHash === ch) { log.duplicates++; line('dup', label + 'DUPLICATE: matches published item "' + pub.id + '" (no changes)'); return; }
          queue.unshift({ qid: Store.uid('q'), kind: 'update', existingId: pub.id, source: src.id, type: src.target, fingerprint: fp, hash: ch, mapped: m, previous: { title: pub.title && pub.title.en, summary: pub.summary && pub.summary.en }, status: 'pending', date: Store.now() });
          log.updated++; line('upd', label + 'CHANGED at source: update queued for review (published item "' + pub.id + '")'); return;
        }
        queue.unshift({ qid: Store.uid('q'), kind: 'new', source: src.id, type: src.target, fingerprint: fp, hash: ch, mapped: m, status: 'pending', date: Store.now() });
        log.created++; line('new', label + 'NEW: mapped to "' + src.target + '", sector=' + m.sector + ', location=' + m.loc + ': queued for review');
      });
      log.status = log.errors.length ? 'warning' : 'success';
    } catch (e) {
      log.status = 'error';
      log.errors.push(e.message);
      line('error', 'FAILED: ' + e.message);
      line('info', 'No records changed. Will retry at next scheduled run. Admin notified by email.');
      Store.mail('admin@oilskill-demo.test', 'mail.syncError', 'en', { source: src.name, error: e.message });
    }
    log.end = Store.now();
    line('info', 'Finished: ' + log.created + ' new, ' + log.updated + ' updated, ' + log.duplicates + ' duplicates, ' + log.skipped + ' skipped, ' + (log.status === 'error' ? 1 : 0) + ' fatal errors');
    Store.set('queue', queue);
    Store.push('synclog', log);
    return log;
  }

  function approve(qid, opts) {
    opts = opts || {};
    var queue = Store.get('queue', []), q = queue.filter(function (x) { return x.qid === qid; })[0];
    if (!q) return null;
    var m = Object.assign({}, q.mapped, opts.edits || {});
    var mt = MT[m.externalId];
    var title = { en: m.title }, summary = { en: m.summary };
    if (opts.translate && mt) { title.pt = mt.pt; title.fr = mt.fr; }
    var item = {
      title: title, summary: summary, sector: m.sector, loc: m.loc, date: m.date, imported: true, mt: !!(opts.translate && mt),
      source: { name: m.sourceName, url: m.sourceUrl, importedAt: Store.now(), externalId: m.externalId, sourceId: m.sourceId },
      syncFingerprint: q.fingerprint, syncHash: q.hash, status: 'publish', premium: false
    };
    if (q.type === 'opp') { item.org = m.org; item.type = m.type; item.close = m.close; item.desc = summary; }
    if (q.type === 'news') item.cat = m.cat;
    if (q.type === 'intel') { item.cat = m.cat; item.type = m.type; item.points = []; }
    if (q.kind === 'update') { item.id = q.existingId; item.updatedAtSource = Store.now(); }
    else item.id = 'imp_' + q.type + '_' + (m.externalId || Store.uid('x')).replace(/[^A-Za-z0-9]/g, '');
    Repo.save(q.type, item);
    q.status = 'approved'; q.reviewed = Store.now(); q.publishedId = item.id;
    Store.set('queue', queue);
    return item;
  }
  function reject(qid) {
    var queue = Store.get('queue', []), q = queue.filter(function (x) { return x.qid === qid; })[0];
    if (!q) return;
    q.status = 'rejected'; q.reviewed = Store.now();
    var r = Store.get('rejected', []); r.push(q.fingerprint); Store.set('rejected', r);
    Store.set('queue', queue);
  }

  window.Sync = { sources: SOURCES, run: run, approve: approve, reject: reject, rawPreview: rawPreview, hasMT: function (id) { return !!MT[id]; } };
})();
