/* Overmind Terminal — Command & Build pages */
(function () {
  'use strict';
  var D = window.OM, U = window.UI, F = U.F, T = D.totals, esc = U.esc, icon = U.icon;
  var PAGES = window.PAGES = window.PAGES || {};
  var dayLabels = D.daily.map(function (d) { return F.date(d.date); });
  function agentRow(a) { var m = D.model(a.model); return ['<a href="agent-detail.html?id=' + a.id + '"><b>' + esc(a.name) + '</b></a> <span class="muted mono">' + a.id + '</span>', U.badge(a.status), esc(m.name), F.tok(a.tokens), F.money(a.cost), a.status === 'paused' ? '—' : F.pct(a.uptime, 2), F.ago(a.lastRun)]; }
  var agentCols = ['Agent', 'Status', 'Model', { label: 'Tokens 30d', num: 1 }, { label: 'Cost 30d', num: 1 }, { label: 'Uptime', num: 1 }, 'Last run'];
  PAGES.__agentRow = agentRow; PAGES.__agentCols = agentCols;

  /* ================= OVERVIEW ================= */
  PAGES.__liveCount = function (st) { var S = D.Live.state; return st === 'all' ? D.agents.length : D.agents.filter(function (a) { return S.agents[a.id].status === st; }).length; };
  PAGES.__liveMix = function () { return ['idle', 'paused', 'error', 'deploying'].map(function (s) { return PAGES.__liveCount(s) + ' ' + s; }).join(' · '); };
  PAGES.index = { render: function () {
    var top = D.agents.slice().sort(function (a, b) { return b.cost - a.cost; }).slice(0, 6);
    return U.head('Mission control', 'Good afternoon, Mr Deedz', 'Your fleet of ' + T.agents + ' agents processed ' + F.tok(T.tokens) + ' tokens across ' + F.int(T.runs) + ' runs in the last 30 days.',
      '<button class="btn" id="iPause" data-handled aria-pressed="' + D.Live.state.paused + '">' + icon(D.Live.state.paused ? 'play' : 'pause') + (D.Live.state.paused ? 'Resume live' : 'Pause live') + '</button>' + U.btn('Agent monitor', { href: 'monitor.html', icon: 'eye' }) + U.btn('New agent', { href: 'create-agent.html', icon: 'plus', cls: 'primary' })) +
      '<div class="kpis">' + U.kpi('Agents live', '<span id="iRunK">' + D.Live.running() + '</span> / <span data-kpi="agents">' + T.agents + '</span>', '<span id="iMix">' + PAGES.__liveMix() + '</span> · book <span data-kpi="running">' + T.running + '</span> running') +
      U.kpi('Runs · 30d', F.int(T.runs), 'avg ' + F.int(T.runs / 30) + ' per day', 'runs') + U.kpi('Tokens · 30d', F.tok(T.tokens), F.int(T.tokens) + ' total', 'tokens') +
      U.kpi('Spend · 30d', F.money(T.cost), F.pct(T.cost / T.budget * 100) + ' of ' + F.money(T.budget, 0) + ' budget', 'cost') + '</div>' +
      '<section class="panel live-bar"><div class="panel-b row" style="gap:8px 18px"><span class="badge b-running" id="iLive">' + (D.Live.state.paused ? 'PAUSED' : 'LIVE') + '</span><span><b class="mono" id="iRun">' + D.Live.running() + '</b> agents running now</span><span class="muted" id="iSess">' + PAGES.__sessionLine() + '</span><span class="muted">30-day totals above stay fixed to the number book</span></div></section>' +
      '<div class="grid">' + U.panel('Live fleet', '<div class="strip" id="iStrip"></div>', { cls: 's12', sub: 'click an agent to open it', tools: U.btn('Open monitor', { href: 'monitor.html', cls: 'sm ghost' }) }) +
      PAGES.__swarmHTML() +
      U.panel('Fleet tokens per minute · live', '<div id="iChart"></div>', { cls: 's7', sub: 'sampled every second' }) +
      U.panel('Live activity', '<div class="term" style="min-height:0"><div class="term-body" id="iFeed" style="flex:none;height:300px;min-height:0;max-height:none" aria-live="off"></div></div>', { cls: 's5', flush: 1, tools: U.btn('Logs', { href: 'logs.html', cls: 'sm ghost' }) }) +
      U.panel('Spend per day · last 30 days', U.lineChart({ span: 8, labels: dayLabels, series: [{ name: 'Daily spend (USD)', color: 'var(--accent)', values: D.daily.map(function (d) { return d.cost; }), area: 1, total: F.money(T.cost) }], fmt: function (v) { return '$' + (v % 1 ? v.toFixed(1) : v); } }), { cls: 's8', sub: 'sums to ' + F.money(T.cost), tools: U.btn('Usage', { href: 'usage.html', cls: 'sm ghost' }) }) +
      U.panel('Fleet status', U.donut({ center: String(T.agents), centerSub: 'agents', items: [{ name: 'Running', value: T.running, color: 'var(--green)' }, { name: 'Idle', value: T.idle, color: 'var(--blue)' }, { name: 'Paused', value: T.paused, color: '#7b8798' }, { name: 'Error', value: T.error, color: 'var(--red)' }, { name: 'Deploying', value: T.deploying, color: 'var(--amber)' }] }), { cls: 's4' }) +
      U.panel('Top agents by spend', U.table(agentCols, top.map(agentRow)), { cls: 's8', flush: 1, tools: U.btn('All agents', { href: 'agents.html', cls: 'sm ghost' }) }) +
      U.panel('Open alerts', '<div class="list">' + D.alerts.filter(function (a) { return a.state === 'open'; }).map(function (a) { return '<div class="li">' + U.badge(a.sev) + '<div class="grow"><div class="t">' + esc(a.title) + '</div><div class="d">' + a.id + ' · ' + F.ago(a.at) + '</div></div></div>'; }).join('') + '</div>', { cls: 's4', flush: 1, sub: '<span data-kpi="openAlerts">' + T.openAlerts + '</span> open', tools: U.btn('View', { href: 'alerts.html', cls: 'sm ghost' }) }) +
      U.panel('Recent runs', U.table(['Run', 'Agent', 'Status', { label: 'Tokens', num: 1 }, { label: 'Duration', num: 1 }, 'Started'], D.runs.slice(0, 6).map(function (r) { return ['<a class="mono" href="trace.html">' + r.id + '</a>', esc(r.agentName), U.badge(r.status), F.int(r.tokens), F.ms(r.duration), F.time(r.started)]; })), { cls: 's12', flush: 1, tools: U.btn('All runs', { href: 'runs.html', cls: 'sm ghost' }) }) +
      '</div>';
  }, init: function () {
    var LV = D.Live, S = LV.state;
    function strip() { U.$('#iStrip').innerHTML = D.agents.map(function (a) { var st = S.agents[a.id].status; return '<a class="strip-i" href="agent-detail.html?id=' + a.id + '" data-sa="' + a.id + '"><span class="dot ' + (st === 'running' ? '' : st) + '"></span><span class="nm">' + esc(a.name) + '</span><span class="st">' + st + '</span></a>'; }).join(''); }
    function chart() { U.$('#iChart').innerHTML = U.lineChart({ span: 7, h: 230, labels: S.tpm.map(function (_, i) { return i === S.tpm.length - 1 ? 'now' : '-' + (S.tpm.length - 1 - i) + 's'; }), every: 6, series: [{ name: 'Fleet tokens / min', color: 'var(--blue)', values: S.tpm, area: 1, total: F.int(S.tpm[S.tpm.length - 1]) + ' now' }], fmt: F.tok }); }
    var fd = U.$('#iFeed');
    function feed() { fd.innerHTML = S.events.slice(-60).map(PAGES.__feedLine).join(''); fd.scrollTop = fd.scrollHeight; }
    function onTick() { strip(); chart(); U.$('#iRunK').textContent = LV.running(); U.$('#iMix').textContent = PAGES.__liveMix(); U.$('#iRun').textContent = LV.running(); U.$('#iSess').textContent = PAGES.__sessionLine(); fd.insertAdjacentHTML('beforeend', PAGES.__feedLine(S.events[S.events.length - 1])); if (fd.children.length > 80) fd.firstChild.remove(); fd.scrollTop = fd.scrollHeight; }
    document.addEventListener('click', function (e) { var p = e.target.closest('#iPause'); if (!p) return; var on = !S.paused; LV.setPaused(on); p.setAttribute('aria-pressed', on); p.innerHTML = icon(on ? 'play' : 'pause') + (on ? 'Resume live' : 'Pause live'); U.$('#iLive').textContent = on ? 'PAUSED' : 'LIVE'; U.toast(on ? 'Live feed paused' : 'Live feed resumed'); });
    strip(); chart(); feed(); window.addEventListener('om:tick', onTick); LV.start(); PAGES.__swarmInit();
  } };

  /* ================= TERMINAL ================= */
  var CMDS = { '/help': 'List commands', '/agents': 'List agents  [--status s]', '/run': 'Run an agent  <name> "<prompt>"', '/deploy': 'Deploy an agent  <name>', '/logs': 'Tail logs  [agent]', '/models': 'List models & prices', '/status': 'Fleet health summary', '/cost': '30-day spend breakdown', '/clear': 'Clear the screen', '/history': 'Show command history', 'whoami': 'Current user', 'date': 'Server date' };
  PAGES.terminal = { render: function () {
    return U.head('Command terminal', 'Terminal', 'Talk to your fleet. Tab autocompletes, ↑/↓ walks history, and every session gets its own tab.', U.btn('New session', { icon: 'plus', id: 'newTab', attrs: ' data-handled' }) + U.btn('Clear', { icon: 'trash', id: 'clearTerm', attrs: ' data-handled' })) +
      '<div class="grid"><div class="s8" style="min-width:0"><div class="term" data-own><div class="term-tabs" role="tablist" id="tabs"></div><div class="term-body" id="out" aria-live="polite"></div><div class="term-input"><span class="p" id="ps">deedz@overmind:~$</span><input id="cmd" autocomplete="off" spellcheck="false" aria-label="Command input" placeholder="type /help"></div></div></div>' +
      '<div class="s4" style="display:flex;flex-direction:column;gap:16px;min-width:0">' + U.panel('Slash commands', '<div class="list">' + Object.keys(CMDS).slice(0, 8).map(function (c) { return '<div class="li"><button class="btn sm mono" data-handled data-ins="' + c + '">' + c + '</button><div class="grow d">' + esc(CMDS[c]) + '</div></div>'; }).join('') + '</div>', { flush: 1 }) +
      U.panel('Session', '<dl class="kv"><dt>Workspace</dt><dd>deedz-dev/prod</dd><dt>Default model</dt><dd>orion-4</dd><dt>Agents live</dt><dd><span data-kpi="running">' + T.running + '</span> / ' + T.agents + '</dd><dt>Shortcut</dt><dd><kbd>Ctrl</kbd> <kbd>K</kbd> palette</dd></dl>') + '</div></div>';
  }, init: function () {
    var out = U.$('#out'), inp = U.$('#cmd'), tabsEl = U.$('#tabs'), sessions = [], cur = 0, n = 0, busy = false;
    function S() { return sessions[cur]; }
    function line(html) { var d = document.createElement('div'); d.className = 'ln'; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; S().buf.push(html); return d; }
    function drawTabs() { tabsEl.innerHTML = sessions.map(function (s, i) { return '<button class="term-tab" role="tab" data-handled data-tab="' + i + '" aria-selected="' + (i === cur) + '">' + icon('term') + esc(s.name) + (sessions.length > 1 ? '<span class="x" data-x="' + i + '" aria-label="Close tab">×</span>' : '') + '</button>'; }).join('') + '<button class="term-tab" data-handled data-newtab aria-label="New tab">＋</button>'; }
    function show() { out.innerHTML = S().buf.map(function (h) { return '<div class="ln">' + h + '</div>'; }).join(''); out.scrollTop = out.scrollHeight; drawTabs(); inp.focus(); }
    function newSession(name) { n++; sessions.push({ name: name || 'session-' + n, buf: [], hist: [], hi: -1 }); cur = sessions.length - 1; show();
      line('<span class="v">OVERMIND TERMINAL v1.0.0</span> <span class="o">· connected to deedz-dev/prod · ' + T.running + ' agents live</span>'); line('<span class="o">Type </span><span class="k">/help</span><span class="o"> to see commands. Tab to autocomplete.</span>'); }
    function stream(text, cls, done) {
      busy = true; var d = line('<span class="' + (cls || 'o') + '"></span><span class="caret"></span>'), sp = d.firstChild, i = 0;
      (function tick() { i += 3; sp.textContent = text.slice(0, i); out.scrollTop = out.scrollHeight; if (i < text.length) setTimeout(tick, 12); else { d.lastChild.remove(); S().buf[S().buf.length - 1] = d.innerHTML; busy = false; done && done(); } })();
    }
    function pad(s, n) { s = String(s); return s.length >= n ? s.slice(0, n) : s + new Array(n - s.length + 1).join(' '); }
    function findAgent(q) { q = (q || '').toLowerCase(); return D.agents.filter(function (a) { return a.name.toLowerCase() === q || a.id.toLowerCase() === q || a.name.toLowerCase().indexOf(q) === 0; })[0]; }
    function exec(raw) {
      var c = raw.trim(); line('<span class="p">deedz@overmind:~$</span> <span class="c">' + esc(c) + '</span>'); if (!c) return;
      S().hist.push(c); S().hi = -1; var parts = c.split(/\s+/), cmd = parts[0].toLowerCase(), arg = parts.slice(1).join(' ');
      if (cmd === '/help' || cmd === 'help') { Object.keys(CMDS).forEach(function (k) { line('<span class="k">' + esc(pad(k, 10)) + '</span> <span class="o">' + esc(CMDS[k]) + '</span>'); }); }
      else if (cmd === '/agents') { var st = (arg.match(/--status\s+(\w+)/) || [])[1]; var list = D.agents.filter(function (a) { return !st || a.status === st; });
        line('<span class="w">' + esc(pad('ID', 7) + pad('NAME', 14) + pad('MODEL', 16) + pad('STATUS', 11) + pad('TOKENS', 9) + 'COST') + '</span>');
        list.forEach(function (a) { line('<span class="' + (a.status === 'error' ? 'e' : 'o') + '">' + esc(pad(a.id, 7) + pad(a.name, 14) + pad(a.model, 16) + pad(a.status, 11) + pad(F.tok(a.tokens), 9) + F.money(a.cost)) + '</span>'); });
        line('<span class="v">' + list.length + ' agent(s)' + (st ? ' with status ' + esc(st) : ' · ' + T.running + ' running') + '</span>'); }
      else if (cmd === '/models') { D.models.forEach(function (m) { line('<span class="o">' + esc(pad(m.id, 16) + pad(D.provider(m.provider).name, 21) + pad(m.ctx + 'k ctx', 9) + '$' + m.price.toFixed(2) + '/1M') + '</span>'); }); }
      else if (cmd === '/status') { line('<span class="o">fleet   </span><span class="p">' + T.running + ' running</span><span class="o"> · ' + T.idle + ' idle · ' + T.paused + ' paused · </span><span class="e">' + T.error + ' error</span><span class="o"> · ' + T.deploying + ' deploying</span>'); line('<span class="o">alerts  ' + T.openAlerts + ' open · spend ' + F.money(T.cost) + ' / ' + F.money(T.budget, 0) + '</span>'); }
      else if (cmd === '/cost') { D.byModel.filter(function (b) { return b.agents; }).forEach(function (b) { line('<span class="o">' + esc(pad(b.name, 16) + pad(b.agents + ' agents', 11) + F.money(b.cost)) + '</span>'); }); line('<span class="v">total   ' + F.money(T.cost) + ' (30d)</span>'); }
      else if (cmd === '/run') { var m = arg.match(/^(\S+)\s*(.*)$/), a = m && findAgent(m[1]); if (!a) { line('<span class="e">error: unknown agent. usage: /run &lt;name&gt; "&lt;prompt&gt;"</span>'); return; }
        var pr = (m[2] || '"status report"').replace(/^"|"$/g, ''); line('<span class="k">▶ ' + esc(a.name) + '</span> <span class="o">(' + a.model + ') · ' + D.nextRunId + ' · thinking…</span>');
        var txt = 'Understood — "' + pr + '".\n1. Pulled context from 3 sources (vector.search, web.search).\n2. Drafted answer with ' + a.model + ' at temperature ' + a.temp + '.\n3. Guardrail check passed.\n\nResult: ' + a.name + ' completed the task. 1,284 tokens · ' + F.money(1284 / 1e6 * D.model(a.model).price, 4) + ' · 2.41 s';
        stream(txt, 'o', function () { line('<span class="p">✔ done</span> <span class="o">· trace: trace.html</span>'); }); }
      else if (cmd === '/deploy') { var ag = findAgent(arg); if (!ag) { line('<span class="e">error: /deploy needs an agent name</span>'); return; }
        stream('building ' + ag.name + ' ' + ag.version + ' … ok\npushing config … ok\nhealth check … 3/3 passed\nrollout 100% · ' + ag.name + ' is live', 'o', function () { line('<span class="p">✔ deployed ' + esc(ag.name) + '</span>'); }); }
      else if (cmd === '/logs') { var la = findAgent(arg) || D.agents[0]; ['INFO  planner step 1/4 started', 'INFO  tool web.search → 8 results (412 ms)', 'DEBUG cache hit vector.search docs-core', 'WARN  retrying http.fetch (429)', 'INFO  step 4/4 complete · 1.92 s'].forEach(function (l, i) { setTimeout(function () { line('<span class="' + (l.indexOf('WARN') === 0 ? 'w' : 'o') + '">13:5' + i + ':0' + i + '  ' + esc(la.name) + '  ' + esc(l) + '</span>'); }, i * 180); }); }
      else if (cmd === '/clear' || cmd === 'clear') { S().buf = []; out.innerHTML = ''; }
      else if (cmd === '/history' || cmd === 'history') { S().hist.forEach(function (h, i) { line('<span class="o">' + (i + 1) + '  ' + esc(h) + '</span>'); }); }
      else if (cmd === 'whoami') line('<span class="o">mr-deedz (owner) · deedz-dev</span>');
      else if (cmd === 'date') line('<span class="o">Mon 12 Oct 2026 14:00 SAST</span>');
      else line('<span class="e">command not found: ' + esc(cmd) + '</span> <span class="o">— try /help</span>');
    }
    var sugg = null, si = 0;
    function suggest() { var v = inp.value; if (sugg) { sugg.remove(); sugg = null; } if (!v || v.indexOf(' ') >= 0) return; var ms = Object.keys(CMDS).filter(function (k) { return k.indexOf(v) === 0 && k !== v; }); if (!ms.length) return;
      si = Math.min(si, ms.length - 1); sugg = document.createElement('div'); sugg.className = 'suggest'; sugg.innerHTML = ms.map(function (k, i) { return '<div data-s="' + k + '" aria-selected="' + (i === si) + '"><b>' + k + '</b>' + esc(CMDS[k]) + '</div>'; }).join(''); inp.parentNode.appendChild(sugg); }
    inp.addEventListener('input', function () { si = 0; suggest(); });
    inp.addEventListener('keydown', function (e) {
      var s = S();
      if (e.key === 'Enter') { if (busy) return; var v = inp.value; inp.value = ''; if (sugg) { sugg.remove(); sugg = null; } exec(v); }
      else if (e.key === 'Tab') { e.preventDefault(); var ms = Object.keys(CMDS).filter(function (k) { return k.indexOf(inp.value) === 0; }); if (ms.length) { inp.value = (sugg ? ms[si] : ms[0]) + ' '; if (sugg) { sugg.remove(); sugg = null; } } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (sugg) { si = Math.max(0, si - 1); suggest(); return; } if (!s.hist.length) return; s.hi = s.hi < 0 ? s.hist.length - 1 : Math.max(0, s.hi - 1); inp.value = s.hist[s.hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (sugg) { si++; suggest(); return; } if (s.hi < 0) return; s.hi++; if (s.hi >= s.hist.length) { s.hi = -1; inp.value = ''; } else inp.value = s.hist[s.hi]; }
    });
    document.addEventListener('click', function (e) {
      var sg = e.target.closest('[data-s]'); if (sg) { inp.value = sg.getAttribute('data-s') + ' '; sugg.remove(); sugg = null; inp.focus(); return; }
      var x = e.target.closest('[data-x]'); if (x) { e.stopPropagation(); var i = +x.getAttribute('data-x'); sessions.splice(i, 1); cur = Math.max(0, Math.min(cur, sessions.length - 1)); show(); return; }
      var t = e.target.closest('[data-tab]'); if (t) { cur = +t.getAttribute('data-tab'); show(); return; }
      if (e.target.closest('[data-newtab]') || e.target.closest('#newTab')) { newSession(); return; }
      if (e.target.closest('#clearTerm')) { S().buf = []; out.innerHTML = ''; U.toast('Session cleared'); return; }
      var ins = e.target.closest('[data-ins]'); if (ins) { var c = ins.getAttribute('data-ins'); if (busy) return; exec(c === '/run' ? '/run atlas "summarise overnight alerts"' : c === '/deploy' ? '/deploy kiln' : c); }
    });
    newSession('prod'); exec('/status');
  } };

  /* ================= AGENTS ================= */
  PAGES.agents = { render: function () {
    var chips = [['all', 'All', T.agents], ['running', 'Running', T.running], ['idle', 'Idle', T.idle], ['paused', 'Paused', T.paused], ['error', 'Error', T.error], ['deploying', 'Deploying', T.deploying]];
    return U.head('Agent fleet', 'Agents', T.agents + ' agents · ' + F.tok(T.tokens) + ' tokens · ' + F.money(T.cost) + ' spent in 30 days.', U.btn('Import YAML', { icon: 'upload', toast: 'Import dialog — demo' }) + U.btn('Create agent', { href: 'create-agent.html', icon: 'plus', cls: 'primary' })) +
      '<section class="panel"><div class="panel-h"><div class="chips-row" id="chips">' + chips.map(function (c, i) { return '<button class="chip" data-handled data-f="' + c[0] + '" aria-pressed="' + (i === 0) + '">' + c[1] + ' <span class="n">' + c[2] + '</span></button>'; }).join('') + '</div>' +
      '<div class="tools"><input class="input" id="q" placeholder="Search name, role, id…" style="width:200px" aria-label="Search agents"><select class="input" id="mf" style="width:150px" aria-label="Model filter"><option value="">All models</option>' + D.models.map(function (m) { return '<option value="' + m.id + '">' + m.name + '</option>'; }).join('') + '</select>' +
      '<button class="btn sm" data-handled data-view="grid" aria-pressed="true">' + icon('grid') + 'Grid</button><button class="btn sm" data-handled data-view="list" aria-pressed="false">' + icon('list') + 'List</button></div></div><div class="panel-b" id="fleet"></div></section>';
  }, init: function () {
    var st = 'all', view = 'grid', box = U.$('#fleet');
    function draw() {
      var q = U.$('#q').value.toLowerCase(), mf = U.$('#mf').value;
      var list = D.agents.filter(function (a) { return (st === 'all' || a.status === st) && (!mf || a.model === mf) && (!q || (a.name + ' ' + a.role + ' ' + a.id).toLowerCase().indexOf(q) >= 0); });
      if (!list.length) { box.innerHTML = U.empty('No agents match', 'Clear the filters or create a new agent.', '<button class="btn sm" data-handled id="reset">Reset filters</button>'); return; }
      if (view === 'list') { box.innerHTML = U.table(agentCols, list.map(agentRow)); box.classList.add('flush'); return; }
      box.classList.remove('flush');
      box.innerHTML = '<div class="cards">' + list.map(function (a) { var m = D.model(a.model); return '<article class="panel card"><div class="top"><div class="agent-ico">' + icon('bot') + '</div><div class="grow"><h4><a href="agent-detail.html?id=' + a.id + '">' + esc(a.name) + '</a></h4><div class="muted" style="font-size:12.5px">' + a.id + ' · ' + esc(a.role) + '</div></div>' + U.badge(a.status) + '</div>' +
        '<div class="metrics"><div><b>' + F.tok(a.tokens) + '</b><span>tokens</span></div><div><b>' + F.money(a.cost) + '</b><span>cost 30d</span></div><div><b>' + (a.status === 'paused' ? '—' : F.pct(a.uptime, 2)) + '</b><span>uptime</span></div></div>' +
        '<div class="row" style="justify-content:space-between;font-size:12.5px"><span class="mono muted">' + esc(m.name) + '</span><span class="muted">last run ' + F.ago(a.lastRun) + '</span></div>' +
        '<div class="row">' + U.btn('Run', { cls: 'sm', icon: 'play', toast: a.name + ' run started' }) + U.btn(a.status === 'paused' ? 'Resume' : 'Pause', { cls: 'sm ghost', toast: a.name + (a.status === 'paused' ? ' resumed' : ' paused') }) + U.btn('Open', { cls: 'sm ghost', href: 'agent-detail.html?id=' + a.id }) + '</div></article>'; }).join('') + '</div>';
    }
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-f]'); if (c) { st = c.getAttribute('data-f'); U.$$('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b === c); }); draw(); }
      var v = e.target.closest('[data-view]'); if (v) { view = v.getAttribute('data-view'); U.$$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', b === v); }); draw(); }
      if (e.target.closest('#reset')) { st = 'all'; U.$('#q').value = ''; U.$('#mf').value = ''; U.$$('[data-f]').forEach(function (b, i) { b.setAttribute('aria-pressed', i === 0); }); draw(); }
    });
    U.$('#q').addEventListener('input', draw); U.$('#mf').addEventListener('change', draw); draw();
  } };

  /* ================= AGENT DETAIL ================= */
  function curAgent() { var id = (location.search.match(/id=([\w-]+)/) || [])[1]; return D.agent(id) || D.agents[0]; }
  PAGES['agent-detail'] = { render: function () {
    var a = curAgent(), m = D.model(a.model), runs = D.runs.filter(function (r) { return r.agent === a.id; });
    var prompt = 'You are ' + a.name + ', the ' + a.role.toLowerCase() + ' agent for Deedz Dev.\n\n## Goals\n- Complete the task end to end.\n- Cite every external source.\n- Ask before any irreversible action.\n\n## Tools\n' + a.tools.map(function (t) { return '- ' + t; }).join('\n') + '\n\n## Style\nConcise, structured, no filler.\nReturn JSON when the caller asks for it.';
    return U.head('Agent · ' + a.id, esc(a.name) + ' ' + U.badge(a.status), esc(a.role) + ' · ' + esc(m.name) + ' · owned by ' + esc(a.owner) + ' · ' + a.version,
      U.btn('Back to fleet', { href: 'agents.html', icon: 'grid', cls: 'ghost' }) + U.btn('Run now', { icon: 'play', toast: a.name + ' run started · ' + D.nextRunId }) + U.btn('Deploy', { icon: 'rocket', cls: 'primary', toast: a.name + ' ' + a.version + ' deploying' })) +
      '<div class="kpis">' + U.kpi('Tokens · 30d', F.tok(a.tokens), F.int(a.tokens) + ' tokens') + U.kpi('Cost · 30d', F.money(a.cost), '$' + m.price.toFixed(2) + ' per 1M tokens') + U.kpi('Runs · 30d', F.int(a.runs), F.pct(a.successRate) + ' success') + U.kpi('Uptime', a.status === 'paused' ? '—' : F.pct(a.uptime, 2), 'last run ' + F.ago(a.lastRun)) + '</div>' +
      '<section class="panel"><div class="tabs" role="tablist" style="padding:0 10px">' + ['Config', 'System prompt', 'Tools', 'Memory', 'Run history', 'Live logs'].map(function (t, i) { return '<button role="tab" data-handled data-tab="' + i + '" aria-selected="' + (i === 0) + '">' + t + '</button>'; }).join('') + '</div>' +
      '<div class="panel-b" data-pane="0"><div class="grid"><div class="s6"><dl class="kv"><dt>Agent ID</dt><dd>' + a.id + '</dd><dt>Model</dt><dd>' + m.id + ' (' + D.provider(m.provider).name + ')</dd><dt>Temperature</dt><dd>' + a.temp + '</dd><dt>Max tokens</dt><dd>4,096</dd><dt>Context window</dt><dd>' + m.ctx + 'k</dd><dt>Memory items</dt><dd>' + a.memory + '</dd><dt>Version</dt><dd>' + a.version + '</dd><dt>Owner</dt><dd>' + esc(a.owner) + '</dd></dl></div>' +
      '<div class="s6" style="display:flex;flex-direction:column;gap:12px"><label class="f">Model<select class="input">' + D.models.filter(function (x) { return x.kind !== 'embedding'; }).map(function (x) { return '<option' + (x.id === a.model ? ' selected' : '') + '>' + x.id + '</option>'; }).join('') + '</select></label><label class="f">Temperature · <span class="mono" id="tv">' + a.temp + '</span><input type="range" min="0" max="1" step="0.1" value="' + a.temp + '" id="tr"></label>' +
      '<div class="row" style="justify-content:space-between"><span>Require approval for writes</span><button class="toggle" role="switch" aria-checked="true" aria-label="Approval for writes"></button></div><div class="row" style="justify-content:space-between"><span>Stream responses</span><button class="toggle" role="switch" aria-checked="true" aria-label="Streaming"></button></div>' +
      '<div class="row">' + U.btn('Save config', { cls: 'primary sm', toast: 'Config saved · ' + a.version }) + U.btn('Delete agent', { cls: 'danger sm', modal: 'Delete agent' }) + '</div></div></div></div>' +
      '<div class="panel-b" data-pane="1" hidden><div class="editor"><div class="gut" id="gut"></div><textarea id="sp" spellcheck="false" aria-label="System prompt">' + esc(prompt) + '</textarea></div><div class="row" style="margin-top:12px;justify-content:space-between"><span class="muted mono" id="spc"></span><div class="row">' + U.btn('Diff vs live', { cls: 'sm', toast: 'No changes vs live version' }) + U.btn('Save as new version', { cls: 'sm primary', toast: 'Saved prompt as ' + a.version + '.1' }) + '</div></div></div>' +
      '<div class="panel-b flush" data-pane="2" hidden><div class="list">' + D.tools.map(function (t) { var on = a.tools.indexOf(t.id) >= 0; return '<div class="li"><span class="agent-ico" style="width:32px;height:32px">' + icon('wrench') + '</span><div class="grow"><div class="t mono">' + t.id + '</div><div class="d">' + esc(t.desc) + '</div></div>' + U.badge(t.risk, t.risk + ' risk') + '<button class="toggle" role="switch" aria-checked="' + on + '" aria-label="' + t.id + '"></button></div>'; }).join('') + '</div></div>' +
      '<div class="panel-b" data-pane="3" hidden><div class="row" style="margin-bottom:12px"><input class="input" placeholder="Search ' + a.memory + ' memory items…" style="max-width:320px" aria-label="Search memory">' + U.btn('Clear short-term', { cls: 'sm danger', toast: 'Short-term memory cleared' }) + '</div><div class="list">' +
      ['Prefers bullet summaries under 150 words', 'Escalate Sev-1 incidents to #ops-war-room', 'Fiscal year starts 1 March', 'Deedz Dev brand voice: direct, warm, South African English', 'Never email customers without approval'].map(function (mm, i) { return '<div class="li"><span class="badge b-info">' + (i < 2 ? 'long-term' : 'semantic') + '</span><div class="grow t" style="font-weight:500">' + esc(mm) + '</div><span class="muted mono" style="font-size:12px">' + (i + 1) * 3 + 'd ago</span></div>'; }).join('') + '</div></div>' +
      '<div class="panel-b flush" data-pane="4" hidden>' + U.table(['Run', 'Status', 'Trigger', { label: 'Tokens', num: 1 }, { label: 'Cost', num: 1 }, 'Started'], runs.map(function (r) { return ['<a class="mono" href="trace.html">' + r.id + '</a>', U.badge(r.status), r.trigger, F.int(r.tokens), F.money(r.cost, 4), F.date(r.started) + ' ' + F.time(r.started)]; }), { emptyText: 'This agent has no runs in the recent window.' }) + '</div>' +
      '<div class="panel-b flush" data-pane="5" hidden><div id="alog" style="max-height:360px;overflow-y:auto"></div></div></section>';
  }, init: function () {
    var a = curAgent(), sp = U.$('#sp');
    function gut() { var n = sp.value.split('\n').length; U.$('#gut').textContent = Array.from({ length: n }, function (_, i) { return i + 1; }).join('\n'); U.$('#spc').textContent = n + ' lines · ' + sp.value.length + ' chars · ~' + Math.ceil(sp.value.length / 4) + ' tokens'; }
    sp.addEventListener('input', gut); gut();
    U.$('#tr').addEventListener('input', function (e) { U.$('#tv').textContent = e.target.value; });
    U.$$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { var i = b.getAttribute('data-tab'); U.$$('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b); }); U.$$('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== i; }); }); });
    var lg = U.$('#alog'), msgs = ['planner step started', 'tool ' + a.tools[0] + ' ok (318 ms)', 'tokens in 1,204 / out 388', 'guardrail pii-scan passed', 'response streamed to caller'], k = 0;
    function add() { var lv = k % 7 === 5 ? 'WARN' : 'INFO'; var d = document.createElement('div'); d.className = 'logline'; d.innerHTML = '<span class="muted">14:0' + (k % 10) + ':' + String(10 + k % 50) + '</span><span class="lvl-' + lv + '">' + lv + '</span><span class="src muted">' + a.id + '</span><span class="m">' + esc(msgs[k % msgs.length]) + '</span>'; lg.appendChild(d); if (lg.children.length > 60) lg.firstChild.remove(); lg.scrollTop = lg.scrollHeight; k++; }
    for (var i = 0; i < 12; i++) add(); setInterval(add, 1600);
  } };

  /* ================= CREATE AGENT WIZARD ================= */
  PAGES['create-agent'] = { render: function () {
    return U.head('New agent', 'Create agent', 'Five steps from idea to a deployed agent. Start blank or from a template.', U.btn('Browse templates', { href: 'templates.html', icon: 'layers' })) +
      '<div class="steps" id="steps">' + ['Identity', 'Model', 'Tools', 'Knowledge', 'Review'].map(function (s, i) { return '<span class="step" data-step="' + i + '"><b>' + (i + 1) + '</b>' + s + '</span>'; }).join('') + '</div>' +
      '<section class="panel" data-own><div class="panel-b" id="wiz"></div><div class="modal-f"><button class="btn" id="back" data-handled>Back</button><button class="btn primary" id="next" data-handled>Next</button></div></section>';
  }, init: function () {
    var step = 0, st = { name: 'Nova Concierge', role: 'Customer concierge', model: 'orion-4', temp: 0.4, tools: ['web.search', 'vector.search'], store: 'support-kb' };
    var views = [
      function () { return '<div class="grid"><label class="f s6">Agent name<input class="input" data-k="name" value="' + esc(st.name) + '"></label><label class="f s6">Role<input class="input" data-k="role" value="' + esc(st.role) + '"></label><label class="f s12">Goal<textarea class="input" rows="4">Answer customer questions using our support knowledge base and hand off to a human when confidence is low.</textarea></label></div>'; },
      function () { return '<div class="cards">' + D.models.filter(function (m) { return m.kind !== 'embedding'; }).map(function (m) { return '<button class="panel card" data-handled data-model="' + m.id + '" style="text-align:left;cursor:pointer;' + (st.model === m.id ? 'outline:2px solid var(--accent)' : '') + '"><div class="top"><div class="agent-ico">' + icon('cpu') + '</div><div class="grow"><h4>' + m.name + '</h4><div class="muted" style="font-size:12.5px">' + D.provider(m.provider).name + '</div></div></div><div class="metrics"><div><b>$' + m.price.toFixed(2) + '</b><span>per 1M</span></div><div><b>' + m.ctx + 'k</b><span>context</span></div><div><b>' + m.kind + '</b><span>type</span></div></div></button>'; }).join('') + '</div><label class="f" style="margin-top:16px;max-width:360px">Temperature · <span class="mono" id="wt">' + st.temp + '</span><input type="range" min="0" max="1" step="0.1" value="' + st.temp + '" id="wtr"></label>'; },
      function () { return '<div class="list">' + D.tools.map(function (t) { return '<div class="li"><div class="grow"><div class="t mono">' + t.id + '</div><div class="d">' + esc(t.desc) + '</div></div>' + U.badge(t.risk, t.risk + ' risk') + '<button class="toggle" data-handled role="switch" data-tool="' + t.id + '" aria-checked="' + (st.tools.indexOf(t.id) >= 0) + '" aria-label="' + t.id + '"></button></div>'; }).join('') + '</div>'; },
      function () { return '<div class="cards">' + D.stores.map(function (s) { return '<button class="panel card" data-handled data-store="' + s.id + '" style="text-align:left;cursor:pointer;' + (st.store === s.id ? 'outline:2px solid var(--accent)' : '') + '"><h4>' + esc(s.name) + '</h4><div class="metrics"><div><b>' + F.int(s.docs) + '</b><span>docs</span></div><div><b>' + F.int(s.chunks) + '</b><span>chunks</span></div><div><b>' + s.size + ' MB</b><span>size</span></div></div></button>'; }).join('') + '</div>'; },
      function () { var m = D.model(st.model); return '<div class="grid"><div class="s6"><dl class="kv"><dt>Name</dt><dd>' + esc(st.name) + '</dd><dt>Role</dt><dd>' + esc(st.role) + '</dd><dt>Model</dt><dd>' + m.name + '</dd><dt>Temperature</dt><dd>' + st.temp + '</dd><dt>Tools</dt><dd>' + (st.tools.join(', ') || 'none') + '</dd><dt>Knowledge</dt><dd>' + st.store + '</dd><dt>Agent ID</dt><dd>AG-25 (on deploy)</dd></dl></div><div class="s6"><div class="out">agent: ' + esc(st.name.toLowerCase().replace(/\s+/g, '-')) + '\nmodel: ' + st.model + '\ntemperature: ' + st.temp + '\ntools: [' + st.tools.join(', ') + ']\nknowledge: ' + st.store + '\napproval: writes</div></div></div>'; }
    ];
    function draw() { U.$('#wiz').innerHTML = views[step](); U.$$('[data-step]').forEach(function (s, i) { s.className = 'step' + (i === step ? ' on' : i < step ? ' done' : ''); }); U.$('#back').disabled = step === 0; U.$('#next').textContent = step === 4 ? 'Deploy agent' : 'Next';
      var r = U.$('#wtr'); if (r) r.addEventListener('input', function () { st.temp = +r.value; U.$('#wt').textContent = r.value; });
      U.$$('[data-k]').forEach(function (i) { i.addEventListener('input', function () { st[i.getAttribute('data-k')] = i.value; }); }); }
    U.$('#wiz').addEventListener('click', function (e) {
      var m = e.target.closest('[data-model]'); if (m) { st.model = m.getAttribute('data-model'); draw(); U.toast('Model: ' + st.model); }
      var s = e.target.closest('[data-store]'); if (s) { st.store = s.getAttribute('data-store'); draw(); U.toast('Knowledge: ' + st.store); }
      var t = e.target.closest('[data-tool]'); if (t) { var id = t.getAttribute('data-tool'), i = st.tools.indexOf(id); if (i >= 0) st.tools.splice(i, 1); else st.tools.push(id); t.setAttribute('aria-checked', i < 0); }
    });
    U.$('#back').addEventListener('click', function () { if (step > 0) { step--; draw(); } });
    U.$('#next').addEventListener('click', function () { if (step < 4) { step++; draw(); } else { U.toast(st.name + ' deployed as AG-25'); setTimeout(function () { U.nav('agents.html'); }, 700); } });
    draw();
  } };

  /* ================= PLAYGROUND ================= */
  function sliders(pre) { return [['Temperature', 'temp', 0, 2, 0.1, 0.7], ['Top P', 'topp', 0, 1, 0.05, 0.95], ['Max tokens', 'max', 64, 8192, 64, 1024], ['Presence penalty', 'pres', -2, 2, 0.1, 0]].map(function (s) { return '<label class="f">' + s[0] + ' · <span class="mono" id="' + pre + s[1] + 'v">' + s[5] + '</span><input type="range" data-sl="' + pre + s[1] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '" value="' + s[5] + '"></label>'; }).join(''); }
  function modelSelect(id, val) { return '<select class="input" id="' + id + '" aria-label="Model">' + D.models.filter(function (m) { return m.kind === 'chat'; }).map(function (m) { return '<option value="' + m.id + '"' + (m.id === val ? ' selected' : '') + '>' + m.name + ' · $' + m.price.toFixed(2) + '/1M</option>'; }).join('') + '</select>'; }
  function fakeAnswer(model, prompt) {
    var tone = { 'orion-4': 'Here is a structured answer.', 'orion-4-mini': 'Short version:', 'lyra-3-opus': 'Let me reason through this carefully.', 'lyra-3-swift': 'Quick take:', 'atlas-70b': 'Answer (self-hosted):' }[model] || 'Answer:';
    return tone + '\n\n• Restating: "' + prompt + '"\n• Key point 1 — define the agent\'s single job and its success metric.\n• Key point 2 — give it the fewest tools that can finish the job.\n• Key point 3 — log every step so runs are traceable.\n\nNext step: save this as a prompt template and attach it to an agent.';
  }
  function streamInto(el, text, done) { var i = 0; el.textContent = ''; (function t() { i += 4; el.textContent = text.slice(0, i); if (i < text.length) setTimeout(t, 14); else done && done(); })(); }
  function stats(model, text) { var tok = Math.round(text.length / 4) + 96, m = D.model(model); return F.int(tok) + ' tokens · ' + F.money(tok / 1e6 * m.price, 5) + ' · ' + (0.6 + text.length / 900).toFixed(2) + ' s'; }
  PAGES.playground = { render: function () {
    return U.head('Prompt lab', 'Playground', 'Tune a prompt against any model. Costs use the live price table from Models.', U.btn('Compare side by side', { href: 'compare.html', icon: 'split' }) + U.btn('Save to library', { icon: 'book', toast: 'Saved to prompt library as PR-119' })) +
      '<div class="grid"><section class="panel s4"><div class="panel-h"><h3>Parameters</h3></div><div class="panel-b" style="display:flex;flex-direction:column;gap:14px"><label class="f">Model' + modelSelect('pm', 'orion-4') + '</label>' + sliders('p') + '<label class="f">Stop sequence<input class="input mono" value="###"></label></div></section>' +
      '<section class="panel s8"><div class="panel-h"><h3>Prompt</h3><div class="tools">' + U.btn('Load template', { cls: 'sm', toast: 'Template “Research brief” loaded' }) + '</div></div><div class="panel-b" style="display:flex;flex-direction:column;gap:12px"><label class="f">System<textarea class="input" rows="3" id="psys">You are a concise senior AI engineer.</textarea></label><label class="f">User<textarea class="input" rows="4" id="pin">How should I design a support triage agent for 2,000 tickets a day?</textarea></label>' +
      '<div class="row"><button class="btn primary" id="prun" data-handled>' + icon('play') + 'Run</button><span class="muted mono" id="pstat">ready</span></div><div class="out" id="pout" aria-live="polite">Output will stream here.</div></div></section></div>';
  }, init: function () {
    U.$$('[data-sl]').forEach(function (r) { r.addEventListener('input', function () { U.$('#' + r.getAttribute('data-sl') + 'v').textContent = r.value; }); });
    U.$('#prun').addEventListener('click', function () { var m = U.$('#pm').value, txt = fakeAnswer(m, U.$('#pin').value); U.$('#pstat').textContent = 'streaming from ' + m + '…'; streamInto(U.$('#pout'), txt, function () { U.$('#pstat').textContent = stats(m, txt); }); });
  } };
  PAGES.compare = { render: function () {
    function col(k, m) { return '<section class="panel s6"><div class="panel-h"><h3>Model ' + k + '</h3><div class="tools" style="min-width:200px">' + modelSelect('cm' + k, m) + '</div></div><div class="panel-b" style="display:flex;flex-direction:column;gap:10px"><div class="out" id="co' + k + '">Waiting for run…</div><div class="muted mono" id="cs' + k + '">—</div><div class="row">' + U.btn('Prefer this', { cls: 'sm', toast: 'Vote recorded for model ' + k }) + '</div></div></section>'; }
    return U.head('Prompt lab', 'Compare models', 'Run one prompt against two models and compare quality, speed and cost.', U.btn('Playground', { href: 'playground.html', icon: 'spark' })) +
      '<section class="panel"><div class="panel-b" style="display:flex;flex-direction:column;gap:12px"><label class="f">Prompt<textarea class="input" rows="3" id="cin">Write a 3-step plan to cut our agent fleet spend by 20% without hurting quality.</textarea></label><div class="row"><button class="btn primary" id="crun" data-handled>' + icon('play') + 'Run both</button>' + sliders('c').split('</label>')[0] + '</label></div></div></section>' +
      '<div class="grid">' + col('A', 'orion-4') + col('B', 'lyra-3-swift') + '</div>';
  }, init: function () {
    U.$$('[data-sl]').forEach(function (r) { r.addEventListener('input', function () { U.$('#' + r.getAttribute('data-sl') + 'v').textContent = r.value; }); });
    U.$('#crun').addEventListener('click', function () { ['A', 'B'].forEach(function (k) { var m = U.$('#cm' + k).value, t = fakeAnswer(m, U.$('#cin').value); streamInto(U.$('#co' + k), t, function () { U.$('#cs' + k).textContent = stats(m, t); }); }); });
  } };

  /* ================= PROMPTS / TEMPLATES ================= */
  PAGES.prompts = { render: function () {
    var tags = []; D.prompts.forEach(function (p) { if (tags.indexOf(p.tag) < 0) tags.push(p.tag); });
    return U.head('Prompt library', 'Prompts', D.prompts.length + ' versioned prompts used ' + F.int(D.prompts.reduce(function (s, p) { return s + p.uses; }, 0)) + ' times this month.', U.btn('New prompt', { icon: 'plus', cls: 'primary', href: 'playground.html' })) +
      '<section class="panel"><div class="panel-h"><input class="input" id="pq" placeholder="Search prompts…" style="max-width:260px" aria-label="Search prompts"><select class="input" id="pt" style="max-width:170px" aria-label="Tag"><option value="">All tags</option>' + tags.map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></div><div class="panel-b flush" id="plist"></div></section>';
  }, init: function () {
    function draw() { var q = U.$('#pq').value.toLowerCase(), t = U.$('#pt').value; var l = D.prompts.filter(function (p) { return (!t || p.tag === t) && (!q || p.name.toLowerCase().indexOf(q) >= 0); });
      U.$('#plist').innerHTML = U.table(['ID', 'Prompt', 'Tag', 'Version', 'Used by', { label: 'Uses 30d', num: 1 }, 'Edited', ''], l.map(function (p) { return ['<span class="mono">' + p.id + '</span>', '<b>' + esc(p.name) + '</b>', '<span class="badge b-info">' + p.tag + '</span>', '<span class="mono">' + p.version + '</span>', esc(p.agent), F.int(p.uses), p.edited + 'd ago', U.btn('Open', { cls: 'sm', href: 'playground.html' })]; }), { emptyText: 'No prompts match that search.' }); }
    U.$('#pq').addEventListener('input', draw); U.$('#pt').addEventListener('change', draw); draw();
  } };
  PAGES.templates = { render: function () {
    return U.head('Starter kits', 'Agent templates', D.templates.length + ' production-ready blueprints. Pick one and the create wizard fills itself in.', U.btn('Submit template', { icon: 'upload', toast: 'Template submission — demo' })) +
      '<div class="cards">' + D.templates.map(function (t) { var m = D.model(t.model); return '<article class="panel card"><div class="top"><div class="agent-ico">' + icon('layers') + '</div><div class="grow"><h4>' + esc(t.name) + '</h4><div class="muted mono" style="font-size:12px">' + t.id + '</div></div></div><p class="muted" style="margin:0">' + esc(t.desc) + '</p><div class="metrics"><div><b>' + esc(m.name) + '</b><span>model</span></div><div><b>' + t.tools + '</b><span>tools</span></div><div><b>$' + m.price.toFixed(2) + '</b><span>per 1M</span></div></div><div class="row">' + U.btn('Use template', { cls: 'sm primary', href: 'create-agent.html' }) + U.btn('Preview', { cls: 'sm ghost', modal: t.name }) + '</div></article>'; }).join('') + '</div>';
  } };

  /* ================= WORKFLOWS ================= */
  PAGES.workflows = { render: function () {
    return U.head('Orchestration', 'Workflows', D.workflows.length + ' pipelines chaining agents, tools and guardrails.', U.btn('Open builder', { href: 'workflow-builder.html', icon: 'flow', cls: 'primary' })) +
      '<div class="cards">' + D.workflows.map(function (w) { return '<article class="panel card"><div class="top"><div class="agent-ico">' + icon('flow') + '</div><div class="grow"><h4>' + esc(w.name) + '</h4><div class="muted mono" style="font-size:12px">' + w.id + ' · ' + esc(w.schedule) + '</div></div>' + U.badge(w.status) + '</div><div class="metrics"><div><b>' + w.nodes + '</b><span>nodes</span></div><div><b>' + F.int(w.runs) + '</b><span>runs 30d</span></div><div><b>' + (w.status === 'draft' ? '—' : '98.' + w.nodes + '%') + '</b><span>success</span></div></div><div class="row">' + U.btn('Edit', { cls: 'sm', href: 'workflow-builder.html' }) + U.btn('Run', { cls: 'sm ghost', icon: 'play', toast: w.name + ' triggered' }) + '</div></article>'; }).join('') + '</div>';
  } };
  /* Graph renders from data.js (WF-02). Desktop lays steps left→right; below 1024px it stacks top→bottom. */
  var G = D.workflows.filter(function (w) { return w.id === 'WF-02'; })[0];
  var NW = 172, NH = 56;
  function layout() {
    var vertical = window.innerWidth < 1024;
    G.graph.nodes.forEach(function (n) {
      if (vertical) { n.x = 16 + n.lane * (NW + 24); n.y = 16 + n.layer * (NH + 34); }
      else { n.x = 16 + n.layer * (NW + 44); n.y = 20 + n.lane * (NH + 60); }
    });
    var maxX = Math.max.apply(null, G.graph.nodes.map(function (n) { return n.x; })) + NW + 16, maxY = Math.max.apply(null, G.graph.nodes.map(function (n) { return n.y; })) + NH + 16;
    return { w: maxX, h: maxY, vertical: vertical };
  }
  var VB;
  function drawGraph(sel) {
    var g = function (id) { return G.graph.nodes.filter(function (n) { return n.id === id; })[0]; }, s = '<svg id="graph" viewBox="0 0 ' + VB.w + ' ' + VB.h + '" style="width:100%;max-width:' + VB.w + 'px;height:auto;margin:0 auto" role="img" aria-label="Pipeline graph, ' + G.graph.nodes.length + ' nodes">';
    G.graph.edges.forEach(function (e) { var a = g(e[0]), b = g(e[1]), x1, y1, x2, y2, d;
      if (VB.vertical) { x1 = a.x + NW / 2; y1 = a.y + NH; x2 = b.x + NW / 2; y2 = b.y; d = 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + (y1 + 20) + ' ' + x2 + ',' + (y2 - 20) + ' ' + x2 + ',' + y2; }
      else { x1 = a.x + NW; y1 = a.y + NH / 2; x2 = b.x; y2 = b.y + NH / 2; d = 'M' + x1 + ',' + y1 + ' C' + (x1 + 26) + ',' + y1 + ' ' + (x2 - 26) + ',' + y2 + ' ' + x2 + ',' + y2; }
      s += '<path class="edge" d="' + d + '"/><circle cx="' + x2 + '" cy="' + y2 + '" r="3.5" fill="var(--accent)"/>'; });
    G.graph.nodes.forEach(function (n) { s += '<g class="node' + (n.id === sel ? ' sel' : '') + '" data-node="' + n.id + '" transform="translate(' + n.x + ',' + n.y + ')" style="cursor:grab"><rect width="' + NW + '" height="' + NH + '" rx="9"/><text x="12" y="23">' + esc(n.t) + '</text><text class="k" x="12" y="41">' + esc(n.k) + '</text></g>'; });
    return s + '</svg>';
  }
  PAGES['workflow-builder'] = { render: function () {
    VB = layout();
    return U.head('Orchestration · ' + G.id, 'Pipeline builder', 'Drag nodes to rearrange. Click a node to inspect it. ' + esc(G.name) + ' · ' + G.graph.nodes.length + ' nodes · ' + G.graph.edges.length + ' edges.', U.btn('Test run', { icon: 'play', toast: 'Test run ' + D.nextRunId + ' started' }) + U.btn('Publish', { icon: 'rocket', cls: 'primary', toast: G.id + ' published v14' })) +
      '<div class="grid"><section class="panel s12"><div class="panel-h"><h3>Canvas</h3><span class="sub">' + G.graph.nodes.length + ' nodes · ' + G.graph.edges.length + ' edges · drag to move</span><div class="tools">' + ['Agent', 'Tool', 'Guardrail', 'Branch'].map(function (x) { return U.btn('+ ' + x, { cls: 'sm', toast: x + ' node added to canvas' }); }).join('') + '</div></div><div class="panel-b"><div class="canvas-frame" id="cf" style="overflow:hidden;padding:4px">' + drawGraph('n4') + '</div></div></section>' +
      U.panel('Inspector', '<div id="insp"></div>', { cls: 's12' }) + '</div>';
  }, init: function () {
    var sel = 'n4', drag = null, off;
    function node(id) { return G.graph.nodes.filter(function (x) { return x.id === id; })[0]; }
    function insp() { var n = node(sel); U.$('#insp').innerHTML = '<dl class="kv"><dt>Node</dt><dd>' + n.id + ' of ' + G.graph.nodes.length + '</dd><dt>Label</dt><dd>' + esc(n.t) + '</dd><dt>Config</dt><dd>' + esc(n.k) + '</dd><dt>Step</dt><dd>' + (n.layer + 1) + '</dd><dt>Position</dt><dd>' + Math.round(n.x) + ', ' + Math.round(n.y) + '</dd><dt>Retries</dt><dd>2 · backoff 1.5×</dd><dt>Timeout</dt><dd>30 s</dd></dl><div class="row" style="margin-top:14px">' + U.btn('Remove node', { cls: 'sm danger', toast: n.t + ' removed (demo)' }) + '</div>'; }
    function redraw() { U.$('#cf').innerHTML = drawGraph(sel); }
    var cf = U.$('#cf');
    cf.addEventListener('pointerdown', function (e) { var g = e.target.closest('[data-node]'); if (!g) return; sel = g.getAttribute('data-node'); drag = node(sel); var r = U.$('#graph').getBoundingClientRect(), sc = VB.w / r.width; off = { x: (e.clientX - r.left) * sc - drag.x, y: (e.clientY - r.top) * sc - drag.y, sc: sc }; redraw(); insp(); e.preventDefault(); });
    window.addEventListener('pointermove', function (e) { if (!drag) return; var r = U.$('#graph').getBoundingClientRect(); drag.x = Math.max(2, Math.min(VB.w - NW - 2, (e.clientX - r.left) * off.sc - off.x)); drag.y = Math.max(2, Math.min(VB.h - NH - 2, (e.clientY - r.top) * off.sc - off.y)); redraw(); });
    window.addEventListener('pointerup', function () { if (drag) { insp(); drag = null; } });
    insp();
  } };

  /* ================= KNOWLEDGE / STORES / TOOLS / INTEGRATIONS ================= */
  PAGES.knowledge = { render: function () {
    var docs = [['pricing-2026.pdf', 'docs-core', 84, 'indexed'], ['refund-policy.md', 'support-kb', 12, 'indexed'], ['msa-template.docx', 'legal-vault', 211, 'indexed'], ['onboarding-guide.md', 'docs-core', 46, 'indexing'], ['q3-board-call.vtt', 'meetings', 390, 'indexed'], ['api-reference.html', 'docs-core', 612, 'failed'], ['enterprise-faq.md', 'support-kb', 29, 'indexed']];
    return U.head('Knowledge', 'Knowledge base', F.int(T.storeDocs) + ' documents · ' + F.int(T.storeChunks) + ' chunks across ' + D.stores.length + ' vector stores.', U.btn('Vector stores', { href: 'vector-stores.html', icon: 'cube' }) + U.btn('Upload documents', { icon: 'upload', cls: 'primary', toast: 'Upload dialog — demo' })) +
      '<div class="kpis">' + U.kpi('Documents', F.int(T.storeDocs), 'in ' + D.stores.length + ' stores', 'storeDocs') + U.kpi('Chunks', F.int(T.storeChunks), 'avg ' + Math.round(T.storeChunks / T.storeDocs) + ' per doc', 'storeChunks') + U.kpi('Retrieval p95', '184 ms', 'top-k 6 · reranked') + U.kpi('Hit rate', '91.4%', 'answers with ≥1 citation') + '</div>' +
      '<section class="panel"><div class="panel-h"><h3>Ask the knowledge base</h3></div><div class="panel-b"><div class="row"><input class="input" id="kq" style="flex:1;min-width:200px" value="What is our refund window for annual plans?" aria-label="Question"><button class="btn primary" data-handled id="kgo">' + icon('search') + 'Search</button></div><div class="out" id="kout" style="margin-top:12px;min-height:90px">Results appear here with source citations.</div></div></section>' +
      U.panel('Recent documents', U.table(['Document', 'Store', { label: 'Chunks', num: 1 }, 'Status', ''], docs.map(function (d) { return ['<span class="mono">' + d[0] + '</span>', d[1], F.int(d[2]), U.badge(d[3] === 'indexed' ? 'success' : d[3] === 'failed' ? 'failed' : 'deploying', d[3]), U.btn(d[3] === 'failed' ? 'Retry' : 'View', { cls: 'sm', toast: d[0] + (d[3] === 'failed' ? ' re-queued' : ' opened') })]; })), { flush: 1 });
  }, init: function () { U.$('#kgo').addEventListener('click', function () { streamInto(U.$('#kout'), 'Annual plans can be refunded within 30 days of purchase, pro-rated after that.\n\nSources:\n[1] refund-policy.md · chunk 4 · score 0.91\n[2] enterprise-faq.md · chunk 11 · score 0.84'); }); } };
  PAGES['vector-stores'] = { render: function () {
    return U.head('Knowledge', 'Vector stores', D.stores.length + ' stores · ' + F.int(T.storeChunks) + ' chunks · ' + F.int(D.stores.reduce(function (s, x) { return s + x.size; }, 0)) + ' MB.', U.btn('New store', { icon: 'plus', cls: 'primary', modal: 'New vector store' })) +
      U.panel('Stores', U.table(['Store', 'Name', { label: 'Docs', num: 1 }, { label: 'Chunks', num: 1 }, { label: 'Dims', num: 1 }, { label: 'Size', num: 1 }, 'Last sync', ''], D.stores.map(function (s) { return ['<span class="mono">' + s.id + '</span>', '<b>' + esc(s.name) + '</b>', F.int(s.docs), F.int(s.chunks), s.dims, s.size + ' MB', F.ago(s.synced), U.btn('Re-sync', { cls: 'sm', toast: s.id + ' sync started' })]; })), { flush: 1, sub: 'total ' + F.int(T.storeChunks) + ' chunks' }) +
      U.panel('Chunks per store', U.barChart({ span: 12, labels: D.stores.map(function (s) { return s.id; }), values: D.stores.map(function (s) { return s.chunks; }), fmt: F.tok, xTitle: 'store', legend: '<span><i style="background:var(--accent)"></i>Chunks indexed (sum ' + F.int(T.storeChunks) + ')</span>' }));
  } };
  PAGES.tools = { render: function () {
    return U.head('Capabilities', 'Tools', D.tools.length + ' tools available to agents. High-risk tools require approval.', U.btn('Register tool', { icon: 'plus', cls: 'primary', modal: 'Register tool' })) +
      U.panel('Tool registry', U.table(['Tool', 'Description', 'Risk', { label: 'Agents', num: 1 }, { label: 'Calls 30d', num: 1 }, 'Enabled'], D.tools.map(function (t) { return ['<b class="mono">' + t.id + '</b>', esc(t.desc), U.badge(t.risk), t.agents, F.int(t.calls), '<button class="toggle" role="switch" aria-checked="' + t.enabled + '" aria-label="' + t.id + '"></button>']; })), { flush: 1 });
  } };
  PAGES.integrations = { render: function () {
    var c = D.integrations.filter(function (i) { return i.connected; }).length;
    return U.head('Capabilities', 'Integrations', c + ' of ' + D.integrations.length + ' integrations connected.', U.btn('Request integration', { icon: 'plus', toast: 'Request sent to the Overmind team' })) +
      '<div class="cards">' + D.integrations.map(function (i) { return '<article class="panel card"><div class="top"><div class="agent-ico">' + icon('plug') + '</div><div class="grow"><h4>' + i.name + '</h4><div class="muted" style="font-size:12.5px">' + i.cat + '</div></div>' + U.badge(i.connected ? 'success' : 'paused', i.connected ? 'connected' : 'not connected') + '</div><div class="row">' + U.btn(i.connected ? 'Configure' : 'Connect', { cls: 'sm' + (i.connected ? '' : ' primary'), toast: i.name + (i.connected ? ' settings opened' : ' OAuth flow — demo') }) + '</div></article>'; }).join('') + '</div>';
  } };
})();
