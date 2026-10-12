/* Overmind Terminal — Agent swarm (canvas). An orchestrator fans tasks out to short-lived sub-agents spawned by the
 * 24 core agents. Seeded and deterministic; the core number book is never changed: swarm activity is a session delta. */
(function () {
  'use strict';
  var D = window.OM, U = window.UI, F = U.F, T = D.totals, esc = U.esc, icon = U.icon, PAGES = window.PAGES;
  var TOOLS = ['web.search', 'vector.search', 'http.fetch', 'code.exec', 'sql.query', 'pdf.parse', 'slack.post', 'files.read', 'browser', 'github.pr'];
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  PAGES.__swarmHTML = function () {
    return '<section class="panel s12" id="swarm"><div class="panel-h"><h3>Agent swarm</h3><span class="sub">orchestrator → ' + T.agents + ' core agents → live sub-agents</span><div class="tools">' +
      '<label class="row" style="gap:6px;font-size:12.5px">Group<select class="input" id="swGroup" style="width:120px" aria-label="Group by"><option value="workflow">workflow</option><option value="model">model</option><option value="status">status</option></select></label>' +
      '<label class="row" style="gap:6px;font-size:12.5px">Speed<select class="input" id="swSpeed" style="width:80px" aria-label="Speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label>' +
      '<button class="btn sm" id="swZoomOut" data-handled aria-label="Zoom out">−</button><button class="btn sm" id="swZoomIn" data-handled aria-label="Zoom in">＋</button><button class="btn sm" id="swPause" data-handled aria-pressed="false">' + icon('pause') + 'Pause</button></div></div>' +
      '<div class="panel-b"><div class="sw-kpis" id="swK"></div><div class="sw-wrap"><div class="sw-canvas"><canvas id="swC" role="img" aria-label="Swarm graph: clusters of sub-agents around the orchestrator"></canvas><p class="muted sw-hint">Click a cluster label to collapse or expand it · click a dot to inspect a sub-agent</p></div>' +
      '<div class="sw-list"><div class="sw-lh"><b>Working now</b><span class="muted" id="swLc"></span></div><div id="swL"></div></div></div>' +
      '<p class="muted" style="margin:10px 0 0;font-size:12.5px">Book totals stay fixed: <span data-kpi="agents">' + T.agents + '</span> core agents · ' + F.money(T.cost) + ' 30-day spend · <span data-kpi="openAlerts">' + T.openAlerts + '</span> open alerts. Swarm activity is shown as a session delta.</p></div></section>';
  };

  PAGES.__swarmInit = function () {
    var cv = U.$('#swC'); if (!cv) return;
    var sel = null, R = rng(9001), ctx = cv.getContext('2d'), paused = false, speed = 1, group = 'workflow', zoom = 1, collapsed = {};
    var LS = D.Live.state, activeWf = {}; D.workflows.forEach(function (w) { if (w.status === 'active') activeWf[w.id] = 1; });
    // only agents that are running right now, and only into active workflows (or standalone): never idle/paused agents or paused/draft workflows
    function cores() { return D.agents.filter(function (a) { return LS.agents[a.id].status === 'running' && LS.agents[a.id].home === 'running' && (!a.workflow || activeWf[a.workflow]); }); }
    var subs = [], seq = 0, queue = 24, spawned = 0, done = 0, failed = 0, killed = 0, sessCost = 0, pulses = [], CAP = 140, target = 124;
    function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
    function keyOf(s) { return group === 'workflow' ? (s.wf || 'standalone') : group === 'model' ? s.model : s.status; }
    function spawn() {
      var cs = cores(); if (!cs.length) return; var p = cs[Math.floor(R() * cs.length)], m = p.model;
      var s = { id: 'SA-' + String(++seq).padStart(4, '0'), parent: p, wf: p.workflow, model: m, status: 'working', step: 0, steps: 3 + Math.floor(R() * 6),
        tool: TOOLS[Math.floor(R() * TOOLS.length)], tps: 0, cost: 0, tokens: 0, age: 0, a: R() * Math.PI * 2, r: R(), fade: 1 };
      subs.push(s); spawned++; pulses.push({ from: 'core', to: s, t: 0 });
    }
    for (var i = 0; i < 118; i++) { spawn(); var s0 = subs[i]; s0.step = Math.floor(R() * s0.steps); s0.tps = 10 + Math.floor(R() * 60); }
    pulses = [];
    function step() {
      if (paused) return;
      for (var k = 0; k < speed; k++) {
        // demand: tasks keep arriving; the orchestrator keeps the pool between ~105 and the 140 cap
        target = Math.max(116, Math.min(138, target + Math.round((R() - 0.5) * 6)));
        queue = Math.max(14, Math.min(60, queue + Math.floor(R() * 9) - 3));
        var working = subs.filter(function (s) { return s.status === 'working'; }).length, want = Math.min(CAP - working, Math.max(0, target - working), queue, 14);
        for (var q = 0; q < want; q++) { spawn(); queue--; }
        subs.forEach(function (s) {
          if (s.status === 'working') {
            var price = D.model(s.model).price; s.bt = s.bt || 18 + Math.round(R() * 80); s.bt = Math.max(8, Math.min(110, s.bt + Math.round((R() - 0.5) * 10))); s.tps = Math.max(4, Math.round(s.bt * (0.85 + R() * 0.3))); s.age++;
            var tk = s.tps / 4; s.tokens += tk; s.cost += tk * price / 1e6; sessCost += tk * price / 1e6;
            if (LS.agents[s.parent.id].home !== 'running') { s.status = 'killed'; killed++; s.tps = 0; s.why = 'parent ' + LS.agents[s.parent.id].status; return; }
            if (R() < 0.16) { s.step++; s.tool = TOOLS[Math.floor(R() * TOOLS.length)]; if (R() < 0.3) pulses.push({ from: s, to: 'core', t: 0 }); }
            if (s.step >= s.steps) { if (R() < 0.06) { s.status = 'failed'; failed++; } else { s.status = 'done'; done++; } s.tps = 0; }
          } else { s.fade -= s.status === 'killed' ? 0.025 : 0.05; if (s === sel && s.fade <= 0) sel = null; }
        });
        subs = subs.filter(function (s) { return s.fade > 0; });
      }
      list(); kpis();
    }
    function kpis() {
      var w = subs.filter(function (s) { return s.status === 'working'; }), tps = w.reduce(function (a, s) { return a + s.tps; }, 0), burn = w.reduce(function (a, s) { return a + s.tps * D.model(s.model).price / 1e6; }, 0) * 3600;
      var k = [['Active', F.int(w.length)], ['Spawned', F.int(spawned)], ['Queue depth', F.int(queue)], ['Throughput', F.int(tps) + ' tok/s'], ['Error rate', F.pct(done + failed ? failed / (done + failed) * 100 : 0) + (killed ? ' · ' + killed + ' killed' : '')], ['Burn rate', F.money(burn) + '/h'], ['Session spend', '+' + F.money(sessCost, 4)]];
      U.$('#swK').innerHTML = k.map(function (x) { return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('');
    }
    var rows = [], LN = window.innerWidth < 600 ? 5 : 8, LB = U.$('#swL');
    for (var r = 0; r < LN; r++) { var d = document.createElement('button'); d.className = 'sw-row'; d.setAttribute('data-handled', ''); d.innerHTML = '<span class="a"><b></b><i></i></span><span class="t mono"></span><span class="progress"><i></i></span><span class="m mono"></span>'; LB.appendChild(d); rows.push(d); }
    function list() {
      var w = subs.filter(function (s) { return s.status === 'working'; }).sort(function (a, b) { return b.tps - a.tps; }).slice(0, LN);
      U.$('#swLc').textContent = 'top ' + w.length + ' by tok/s';
      rows.forEach(function (row, i) { var s = w[i]; row.hidden = !s; if (!s) return; row.dataset.sid = s.id;
        row.querySelector('b').textContent = s.id; row.querySelector('.a i').textContent = s.parent.name + ' · ' + s.model;
        row.querySelector('.t').textContent = 'step ' + (s.step + 1) + '/' + s.steps + ' · ' + s.tool + '()';
        row.querySelector('.progress i').style.width = Math.round((s.step + 1) / s.steps * 100) + '%';
        row.querySelector('.m').textContent = s.tps + ' tok/s · ' + (s.cost < 0.0001 ? '<$0.0001' : F.money(s.cost, 4)); });
    }
    // ---- canvas ----
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), hits = [], labels = [], centers = {};
    function size() { var box = cv.parentNode.getBoundingClientRect(); W = Math.max(280, Math.floor(box.width)); H = W < 500 ? 400 : 460; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
    var lastLayout = [], ORB = 26, FOOT = 22;
    // cluster layout: start on an ellipse, push overlapping boxes apart, clamp into the canvas; shrink radii until nothing overlaps
    function layout(cs) {
      var cx = W / 2, cy = H / 2, n = cs.length, shrink = 1;
      for (var tries = 0; tries < 14; tries++) {
        cs.forEach(function (c, i) { c.r = c.col ? 14 : Math.max(7, (7 + Math.sqrt(c.n) * 5) * zoom * shrink); var an = -Math.PI / 2 + i * Math.PI * 2 / n, ring = Math.min(1, 0.62 * zoom);
          c.x = cx + Math.cos(an) * (cx - 12) * ring; c.y = cy + Math.sin(an) * (cy - 20) * ring; });
        function box(c) { var hw = Math.max(c.r, c.tw / 2 + 4); return [c.x - hw, c.y - c.r, c.x + hw, c.y + c.r + 20]; }
        function clamp(c) { var hw = Math.max(c.r, c.tw / 2 + 4); c.x = Math.max(4 + hw, Math.min(W - 4 - hw, c.x)); c.y = Math.max(4 + c.r, Math.min(H - FOOT - 20 - c.r, c.y)); }
        var orb = [cx - ORB - 4, cy - ORB - 4, cx + ORB + 4, cy + ORB + 4];
        for (var it = 0; it < 80; it++) {
          cs.forEach(clamp);
          for (var i = 0; i < n; i++) { var A = box(cs[i]);
            var ox = Math.min(A[2], orb[2]) - Math.max(A[0], orb[0]), oy = Math.min(A[3], orb[3]) - Math.max(A[1], orb[1]);
            if (ox > 0 && oy > 0) { if (ox < oy) cs[i].x += (cs[i].x < cx ? -ox : ox); else cs[i].y += ((A[1] + A[3]) / 2 < cy ? -oy : oy); }
            for (var j = i + 1; j < n; j++) { var B = box(cs[j]); ox = Math.min(A[2], B[2]) - Math.max(A[0], B[0]) + 6; oy = Math.min(A[3], B[3]) - Math.max(A[1], B[1]) + 6;
              if (ox > 0 && oy > 0) { if (ox < oy) { var d = (cs[i].x <= cs[j].x ? -1 : 1) * ox / 2; cs[i].x += d; cs[j].x -= d; } else { var e = (cs[i].y <= cs[j].y ? -1 : 1) * oy / 2; cs[i].y += e; cs[j].y -= e; } A = box(cs[i]); } } }
        }
        cs.forEach(clamp);
        var bad = false, orb2 = orb;
        for (var p = 0; p < n && !bad; p++) { var P = box(cs[p]); if (Math.min(P[2], orb2[2]) - Math.max(P[0], orb2[0]) > 0 && Math.min(P[3], orb2[3]) - Math.max(P[1], orb2[1]) > 0) bad = true;
          for (var q = p + 1; q < n && !bad; q++) { var Q = box(cs[q]); if (Math.min(P[2], Q[2]) - Math.max(P[0], Q[0]) > 0 && Math.min(P[3], Q[3]) - Math.max(P[1], Q[1]) > 0) bad = true; } }
        if (!bad) break; shrink *= 0.86;
      }
      return cs;
    }
    window.__swarmDebug = function () { return { W: W, H: H, active: subs.filter(function (s) { return s.status === 'working'; }).length, clusters: lastLayout.map(function (c) { var hw = Math.max(c.r, c.tw / 2 + 4); return { k: c.k, box: [c.x - hw, c.y - c.r, c.x + hw, c.y + c.r + 20] }; }), labels: labels.map(function (l) { return l.box; }), parents: subs.map(function (s) { return [s.parent.name, s.parent.status, s.wf]; }) }; };
    function draw(ts) {
      if (!cv.isConnected) return; // page swapped away: the loop ends itself
      var acc = css('--accent'), txt = css('--text'), mut = css('--muted'), line = css('--line-2'), red = css('--red'), grn = css('--green'), amb = css('--amber'), pan = css('--panel-2');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, groups = {};
      subs.forEach(function (s) { (groups[keyOf(s)] = groups[keyOf(s)] || []).push(s); });
      var keys = Object.keys(groups).sort(); hits = []; labels = []; centers = {};
      ctx.font = '600 11px ' + css('--mono');
      var L = layout(keys.map(function (k) { var col = !!collapsed[k], lab = k + ' · ' + groups[k].length + (col ? ' +' : ''); return { k: k, n: groups[k].length, col: col, lab: lab, tw: ctx.measureText(lab).width }; }));
      L.forEach(function (c) {
        var list = groups[c.k], gx = c.x, gy = c.y, rad = c.r; centers[c.k] = [gx, gy];
        ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(gx, gy); ctx.stroke();
        ctx.fillStyle = pan; ctx.beginPath(); ctx.arc(gx, gy, rad, 0, 7); ctx.fill(); ctx.strokeStyle = line; ctx.stroke();
        list.forEach(function (s, j) {
          if (c.col) { s.x = gx; s.y = gy; return; }
          var rr = Math.sqrt((j + 0.5) / list.length) * Math.max(1, rad - 4), an = j * 2.399963 + 0.3, x = gx + Math.cos(an) * rr, y = gy + Math.sin(an) * rr;
          s.x = x; s.y = y; ctx.globalAlpha = Math.max(0.2, s.fade);
          ctx.fillStyle = s.status === 'killed' ? mut : s.status === 'failed' ? red : s.status === 'done' ? grn : acc; ctx.beginPath(); ctx.arc(x, y, s.status === 'working' ? Math.min(2.2 + s.tps / 45, rad / 6 + 1.2) : 2, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
          if (s === sel) { ctx.strokeStyle = txt; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.stroke(); ctx.lineWidth = 1; }
          hits.push({ x: x, y: y, s: s });
        });
        var ly = gy + rad + 14;
        ctx.fillStyle = css('--panel'); ctx.fillRect(gx - c.tw / 2 - 4, ly - 11, c.tw + 8, 16); ctx.fillStyle = txt; ctx.textAlign = 'center'; ctx.font = '600 11px ' + css('--mono'); ctx.fillText(c.lab, gx, ly + 1);
        labels.push({ k: c.k, x: gx, y: ly - 3, w: c.tw + 8, box: [gx - c.tw / 2 - 4, ly - 11, c.tw + 8, 16] });
      });
      lastLayout = L;
      ctx.save(); ctx.translate(cx, cy);
      // orchestrator
      ctx.fillStyle = pan; ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, ORB - 2, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = txt; ctx.font = '700 10px ' + css('--mono'); ctx.textAlign = 'center'; ctx.fillText('ORCH', 0, 4);
      ctx.restore();
      // message pulses (animated handoffs)
      pulses.forEach(function (p) { p.t += paused ? 0 : 0.03 * speed; var a = p.from === 'core' ? [cx, cy] : [p.from.x, p.from.y], b = p.to === 'core' ? [cx, cy] : [p.to.x, p.to.y]; if (a[0] == null || b[0] == null) { p.t = 2; return; }
        ctx.strokeStyle = acc; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.globalAlpha = 1;
        var x = a[0] + (b[0] - a[0]) * Math.min(p.t, 1), y = a[1] + (b[1] - a[1]) * Math.min(p.t, 1); ctx.fillStyle = p.from === 'core' ? amb : acc; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); });
      pulses = pulses.filter(function (p) { return p.t < 1; }).slice(-60);
      ctx.fillStyle = mut; ctx.font = '11px ' + css('--mono'); ctx.textAlign = 'left'; ctx.fillText(W < 500 ? group + ' · ' + zoom.toFixed(2) + '× · ' + subs.length + ' on canvas' : 'grouped by ' + group + ' · zoom ' + zoom.toFixed(2) + '× · ' + subs.length + ' sub-agents on canvas', 8, H - 8);
      requestAnimationFrame(draw);
    }
    function drawer(s) {
      U.closeOverlays(); var o = document.createElement('div'); o.setAttribute('data-overlay', '');
      o.innerHTML = '<div class="scrim" data-close style="padding:0"></div><aside class="drawer" role="dialog" aria-label="' + s.id + '"><div class="modal-h"><h3>' + s.id + ' ' + U.badge(s.status === 'killed' ? 'paused' : s.status === 'working' ? 'running' : s.status === 'done' ? 'success' : 'failed', s.status) + '</h3><button class="icon-btn" style="margin-left:auto" data-close aria-label="Close">' + icon('x') + '</button></div><div class="modal-b" style="color:var(--text);display:flex;flex-direction:column;gap:14px">' +
        '<dl class="kv"><dt>Spawned by</dt><dd><a href="agent-detail.html?id=' + s.parent.id + '">' + esc(s.parent.name) + '</a> (' + s.parent.id + ')</dd><dt>State</dt><dd id="swSt">' + s.status + (s.why ? ' · ' + s.why : '') + '</dd><dt>Workflow</dt><dd>' + (s.wf || 'standalone') + '</dd><dt>Model</dt><dd>' + s.model + '</dd><dt>Step</dt><dd>' + Math.min(s.step + 1, s.steps) + ' of ' + s.steps + '</dd><dt>Tool call</dt><dd>' + s.tool + '()</dd><dt>Throughput</dt><dd>' + s.tps + ' tok/s</dd><dt>Tokens</dt><dd>' + F.int(s.tokens) + '</dd><dt>Cost</dt><dd>' + (s.cost < 0.0001 ? '<$0.0001' : F.money(s.cost, 4)) + '</dd></dl>' +
        '<div class="row">' + '<button class="btn sm danger" data-handled id="swKill"' + (s.status === 'working' ? '' : ' disabled') + '>' + icon('stop') + (s.status === 'killed' ? 'Killed' : 'Kill sub-agent') + '</button>' + U.btn('Open parent', { cls: 'sm', href: 'agent-detail.html?id=' + s.parent.id }) + U.btn('Agent monitor', { cls: 'sm ghost', href: 'monitor.html' }) + '</div></div></aside>';
      document.body.appendChild(o); sel = s;
      o.querySelector('#swKill').addEventListener('click', function () { if (s.status !== 'working') return; s.status = 'killed'; s.why = 'killed by operator'; s.tps = 0; killed++; pulses.push({ from: 'core', to: s, t: 0 }); drawer(s); list(); kpis(); U.toast(s.id + ' killed · removed from ' + (s.wf || 'standalone')); });
    }
    cv.addEventListener('click', function (e) {
      var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      var l = labels.filter(function (q) { return Math.abs(q.x - x) < q.w / 2 && Math.abs(q.y - y) < 10; })[0]; if (l) { collapsed[l.k] = !collapsed[l.k]; U.toast(l.k + (collapsed[l.k] ? ' collapsed' : ' expanded')); return; }
      var best = null, bd = 12; hits.forEach(function (h) { var d = Math.hypot(h.x - x, h.y - y); if (d < bd) { bd = d; best = h.s; } }); if (best) drawer(best); else U.toast('Click a dot or a cluster label');
    });
    LB.addEventListener('click', function (e) { var r = e.target.closest('[data-sid]'); if (!r) return; var s = subs.filter(function (q) { return q.id === r.dataset.sid; })[0]; if (s) drawer(s); });
    U.$('#swGroup').addEventListener('change', function (e) { group = e.target.value; collapsed = {}; });
    U.$('#swSpeed').addEventListener('change', function (e) { speed = +e.target.value; U.toast('Swarm speed ' + speed + '×'); });
    U.$('#swZoomIn').addEventListener('click', function () { zoom = Math.min(1.6, zoom + 0.15); U.toast('Zoom ' + zoom.toFixed(2) + '×'); });
    U.$('#swZoomOut').addEventListener('click', function () { zoom = Math.max(0.55, zoom - 0.15); U.toast('Zoom ' + zoom.toFixed(2) + '×'); });
    U.$('#swPause').addEventListener('click', function () { paused = !paused; this.setAttribute('aria-pressed', paused); this.innerHTML = icon(paused ? 'play' : 'pause') + (paused ? 'Resume' : 'Pause'); U.toast(paused ? 'Swarm paused' : 'Swarm resumed'); });
    window.addEventListener('resize', size);
    size(); list(); kpis(); setInterval(step, 250); requestAnimationFrame(draw);
  };
})();
