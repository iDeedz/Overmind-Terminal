/* Overmind Terminal — live Agent monitor. Live values (tokens/s, latency) are simulated around data.js;
 * money, counts and alerts always come straight from the number book. */
(function () {
  'use strict';
  var D = window.OM, U = window.UI, F = U.F, T = D.totals, esc = U.esc, icon = U.icon, PAGES = window.PAGES;
  var LV = D.Live, S = LV.state;
  function task(a) { return LV.task(a, S.agents[a.id].status); }
  function feedLine(e) { var c = e.lvl === 'ERROR' ? 'e' : e.lvl === 'WARN' ? 'w' : 'o'; return '<div class="ln"><span class="k">' + F.time(e.t) + ':' + String(e.t.getSeconds()).padStart(2, '0') + '</span> <span class="v">' + esc(e.id) + '</span> <span class="' + c + '">' + esc(e.name + '  ' + (e.lvl + '     ').slice(0, 6) + e.msg) + '</span></div>'; }
  PAGES.__feedLine = feedLine;
  function sessionLine() { return '+' + F.int(S.session.runs) + ' runs · +' + F.int(S.session.tokens) + ' tokens · +' + F.money(S.session.cost, 4) + ' this session'; }
  PAGES.__sessionLine = sessionLine;
  var failedRecent = D.runs.filter(function (r) { return r.status === 'failed'; }).length;
  var errRate = failedRecent / D.runs.length * 100, today = D.daily[D.daily.length - 1].cost;

  PAGES.monitor = { render: function () {
    var wfs = D.workflows.map(function (w) { return '<option value="' + w.id + '">' + w.id + ' · ' + esc(w.name) + '</option>'; }).join('');
    return U.head('Observability · live', 'Agent monitor', 'Every agent in the fleet, live. Throughput and latency stream in real time; spend and alerts come from the number book.',
      '<button class="btn" id="mPause" data-handled aria-pressed="' + S.paused + '">' + icon(S.paused ? 'play' : 'pause') + (S.paused ? 'Resume stream' : 'Pause stream') + '</button>' + U.btn('Open logs', { href: 'logs.html', icon: 'logs' })) +
      '<div class="kpis">' + U.kpi('Agents running now', '<span id="mRun">' + LV.running() + '</span>', 'book: <span data-kpi="running">' + T.running + '</span> running · <span id="mSess">' + sessionLine() + '</span>') + U.kpi('Error rate', F.pct(errRate), failedRecent + ' failed of last ' + D.runs.length + ' runs') +
      U.kpi('Spend today', F.money(today), 'month ' + F.money(T.cost) + ' of ' + F.money(T.budget, 0) + ' (' + F.pct(T.cost / T.budget * 100) + ')') + U.kpi('Open alerts', '<span data-kpi="openAlerts">' + T.openAlerts + '</span>', '<a href="alerts.html">view alerts</a>') + '</div>' +
      '<section class="panel"><div class="panel-h"><div class="chips-row">' + [['all', 'All'], ['running', 'Running'], ['idle', 'Idle'], ['error', 'Error'], ['paused', 'Paused'], ['deploying', 'Deploying']].map(function (c, i) { return '<button class="chip" data-handled data-ms="' + c[0] + '" aria-pressed="' + (i === 0) + '">' + c[1] + ' <span class="n" data-mc="' + c[0] + '">' + PAGES.__liveCount(c[0]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="tools"><input class="input" id="mq" placeholder="Search agents…" style="width:170px" aria-label="Search agents"><select class="input" id="mm" style="width:150px" aria-label="Model"><option value="">All models</option>' + D.models.map(function (m) { return '<option value="' + m.id + '">' + m.name + '</option>'; }).join('') + '</select><select class="input" id="mw" style="width:190px" aria-label="Workflow"><option value="">All workflows</option>' + wfs + '<option value="none">No workflow</option></select></div></div>' +
      '<div class="panel-b"><div class="mon-grid" id="mgrid"></div></div></section>' +
      '<section class="panel"><div class="panel-h"><h3>Event stream</h3><span class="sub" id="mstate">' + (S.paused ? 'paused' : 'live · 1 event/s') + '</span></div><div class="panel-b flush"><div class="term" style="min-height:0;border:0;border-radius:0"><div class="term-body" id="mlog" style="flex:none;height:280px;min-height:0;max-height:none" aria-live="off"></div></div></div></section>';
  }, init: function () {
    var st = 'all';
    function spark(h) { var mx = Math.max.apply(null, h.concat([1])); return h.map(function (v, k) { return (k * 120 / 23).toFixed(1) + ',' + (30 - v / mx * 26).toFixed(1); }).join(' '); }
    function tile(a) { var L = S.agents[a.id], m = D.model(a.model);
      return '<button class="panel mon-tile" data-handled data-agent="' + a.id + '" aria-label="Open ' + esc(a.name) + '"><span class="top"><span class="dot ' + (L.status === 'running' ? '' : L.status) + '" data-dot></span><b>' + esc(a.name) + '</b><span data-badge>' + U.badge(L.status) + '</span></span>' +
        '<span class="mt" data-task>' + esc(task(a)) + '</span><svg viewBox="0 0 120 32" class="spk" aria-hidden="true"><polyline data-spk points="' + spark(L.hist) + '"/></svg>' +
        '<span class="mrow"><span><b data-tps>' + L.tps + '</b> tok/s</span><span><b data-lat>' + (L.lat ? L.lat + ' ms' : '—') + '</b> p50</span><span><b>' + F.money(a.cost) + '</b> 30d</span></span><span class="mm">' + esc(m.name) + (a.workflow ? ' · ' + a.workflow : '') + '</span></button>'; }
    function list() { var q = U.$('#mq').value.toLowerCase(), mm = U.$('#mm').value, mw = U.$('#mw').value;
      return D.agents.filter(function (a) { return (st === 'all' || S.agents[a.id].status === st) && (!mm || a.model === mm) && (!mw || (mw === 'none' ? !a.workflow : a.workflow === mw)) && (!q || (a.name + ' ' + a.role + ' ' + a.id).toLowerCase().indexOf(q) >= 0); }); }
    function draw() { var l = list(); U.$('#mgrid').innerHTML = l.length ? l.map(tile).join('') : U.empty('No agents match', 'Change the status, model or workflow filter.', '<button class="btn sm" data-handled id="mreset">Reset filters</button>'); }
    var lg = U.$('#mlog');
    function feed() { lg.innerHTML = S.events.slice(-80).map(feedLine).join(''); lg.scrollTop = lg.scrollHeight; }
    function chips() { U.$$('[data-mc]').forEach(function (e) { e.textContent = PAGES.__liveCount(e.getAttribute('data-mc')); }); }
    function onTick() { chips(); if (st !== 'all') { var ids = list().map(function (a) { return a.id; }).join(), have = U.$$('#mgrid [data-agent]').map(function (e) { return e.getAttribute('data-agent'); }).join(); if (ids !== have) draw(); }
      U.$('#mRun').textContent = LV.running(); U.$('#mSess').textContent = sessionLine();
      D.agents.forEach(function (a) { var L = S.agents[a.id], el = U.$('[data-agent="' + a.id + '"]'); if (!el) return;
        el.querySelector('[data-tps]').textContent = L.tps; el.querySelector('[data-lat]').textContent = L.lat ? L.lat + ' ms' : '—'; el.querySelector('[data-spk]').setAttribute('points', spark(L.hist));
        if (el.getAttribute('data-st') !== L.status) { el.setAttribute('data-st', L.status); el.querySelector('[data-dot]').className = 'dot ' + (L.status === 'running' ? '' : L.status); el.querySelector('[data-badge]').innerHTML = U.badge(L.status); el.querySelector('[data-task]').textContent = task(a); } });
      var db = document.getElementById('dBadge'); if (db && openId) { var ls = S.agents[openId].status; if (U.$('#dSt').textContent !== ls) { U.$('#dSt').textContent = ls; db.innerHTML = U.badge(ls); } }
      var last = S.events[S.events.length - 1]; lg.insertAdjacentHTML('beforeend', feedLine(last)); if (lg.children.length > 120) lg.firstChild.remove(); lg.scrollTop = lg.scrollHeight; }
    var openId = null;
    function drawer(a) { var runs = D.runs.filter(function (r) { return r.agent === a.id; }).slice(0, 5), m = D.model(a.model), cur = S.agents[a.id].status;
      openId = a.id; U.closeOverlays(); var s = document.createElement('div'); s.setAttribute('data-overlay', '');
      s.innerHTML = '<div class="scrim" data-close style="padding:0"></div><aside class="drawer" role="dialog" aria-label="' + esc(a.name) + '"><div class="modal-h"><h3>' + esc(a.name) + ' <span id="dBadge">' + U.badge(cur) + '</span></h3><button class="icon-btn" style="margin-left:auto" data-close aria-label="Close">' + icon('x') + '</button></div><div class="modal-b" style="color:var(--text);display:flex;flex-direction:column;gap:14px">' +
        '<dl class="kv"><dt>Agent</dt><dd>' + a.id + ' · ' + esc(a.role) + '</dd><dt>Model</dt><dd>' + m.id + '</dd><dt>Live status</dt><dd id="dSt">' + cur + '</dd><dt>Task</dt><dd>' + esc(task(a)) + '</dd><dt>Workflow</dt><dd>' + (a.workflow || '—') + '</dd><dt>Tokens 30d</dt><dd>' + F.int(a.tokens) + '</dd><dt>Cost 30d</dt><dd>' + F.money(a.cost) + '</dd><dt>Last run</dt><dd>' + F.ago(a.lastRun) + '</dd></dl>' +
        '<div><h4 style="margin-bottom:8px">Latest trace</h4>' + (runs[0] ? '<div class="out" style="min-height:0">' + runs[0].id + ' · ' + runs[0].status + ' · ' + runs[0].steps + ' steps\nplanner → tools (' + a.tools.join(', ') + ') → respond\n' + F.int(runs[0].tokens) + ' tokens · ' + F.ms(runs[0].duration) + '</div><a href="trace.html">Open trace view</a>' : '<p class="muted" style="margin:0">No runs in the recent window.</p>') + '</div>' +
        '<div><h4 style="margin-bottom:8px">Recent runs</h4>' + (runs.length ? '<div class="list">' + runs.map(function (r) { return '<div class="li" style="padding:8px 0"><span class="mono">' + r.id + '</span>' + U.badge(r.status) + '<span class="grow muted" style="text-align:right">' + F.time(r.started) + '</span></div>'; }).join('') + '</div>' : '<p class="muted" style="margin:0">None in the last ' + D.runs.length + ' runs.</p>') + '</div>' +
        '<div class="row">' + '<button class="btn sm" data-handled data-act="' + (cur === 'paused' ? 'resume' : 'pause') + '" data-id="' + a.id + '">' + icon(cur === 'paused' ? 'play' : 'pause') + (cur === 'paused' ? 'Resume' : 'Pause') + '</button><button class="btn sm" data-handled data-act="restart" data-id="' + a.id + '">' + icon('refresh') + 'Restart</button><button class="btn sm danger" data-handled data-act="kill" data-id="' + a.id + '"' + (cur === 'idle' || cur === 'paused' ? ' disabled' : '') + '>' + icon('stop') + 'Kill</button>' + U.btn('Agent page', { cls: 'sm ghost', href: 'agent-detail.html?id=' + a.id }) + '</div></div></aside>';
      document.body.appendChild(s); }
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-ms]'); if (c) { st = c.getAttribute('data-ms'); U.$$('[data-ms]').forEach(function (b) { b.setAttribute('aria-pressed', b === c); }); draw(); return; }
      if (e.target.closest('#mreset')) { st = 'all'; U.$('#mq').value = ''; U.$('#mm').value = ''; U.$('#mw').value = ''; U.$$('[data-ms]').forEach(function (b, i) { b.setAttribute('aria-pressed', i === 0); }); draw(); return; }
      var ac = e.target.closest('[data-act]'); if (ac) { var ag = D.agent(ac.getAttribute('data-id')), w = ac.getAttribute('data-act'); LV.act(ag.id, w); drawer(ag); U.toast(ag.name + ({ pause: ' paused', resume: ' resumed', restart: ' restarting · deploying', kill: ' killed · run cancelled' })[w]); return; }
      var t = e.target.closest('[data-agent]'); if (t) { drawer(D.agent(t.getAttribute('data-agent'))); return; }
      var p = e.target.closest('#mPause'); if (p) { var paused = !S.paused; LV.setPaused(paused); p.setAttribute('aria-pressed', paused); p.innerHTML = icon(paused ? 'play' : 'pause') + (paused ? 'Resume stream' : 'Pause stream'); U.$('#mstate').textContent = paused ? 'paused' : 'live · 1 event/s'; U.toast(paused ? 'Stream paused' : 'Stream resumed'); }
    });
    ['#mq', '#mm', '#mw'].forEach(function (id) { U.$(id).addEventListener(id === '#mq' ? 'input' : 'change', draw); });
    draw(); feed(); window.addEventListener('om:tick', onTick); LV.start();
  } };
})();
