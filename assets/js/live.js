/* Overmind Terminal — shared live simulation engine (used by Overview and Agent monitor).
 * It starts from data.js and never rewrites it: 30-day totals stay exactly as in the number book, and
 * live activity is reported as a separate "this session" delta, so every page agrees. */
(function () {
  'use strict';
  var D = window.OM, nativeSetInterval = window.setInterval.bind(window), nativeClear = window.clearInterval.bind(window);
  function task(a, st) {
    st = st || a.status;
    if (st === 'paused') return 'paused by owner';
    if (st === 'idle') return 'waiting for next trigger';
    if (st === 'deploying') return 'rolling out ' + a.version;
    if (st === 'error') return a.name === 'Harbor' ? 'retry backoff · k8s.rollout timeout' : 'retry backoff · upstream 502';
    return { Research: 'compiling market brief', 'Finance ops': 'reconciling ledger', 'Support triage': 'classifying ticket queue', 'Content writer': 'drafting blog outline', 'Security watch': 'scanning auth logs',
      'Code review': 'reviewing PR #1842', 'Voice summariser': 'summarising call', 'Image tagging': 'tagging product images', 'Internal Q&A': 'answering #help', 'Ticket router': 'routing inbound tickets', 'Invoice parser': 'parsing invoices',
      'Embedding indexer': 'indexing docs-core', 'Policy guard': 'screening outputs', 'Meeting notes': 'writing minutes', 'Data mapping': 'mapping warehouse schema', 'Cloud cost': 'scanning cloud bill',
      'Red-team tester': 'probing jailbreak suite', 'Onboarding guide': 'answering onboarding FAQ' }[a.role] || 'working';
  }
  function base(a, st) { return st === 'running' ? Math.round(a.tokens / 30 / 86400 * 40) + 8 : st === 'deploying' ? 4 : 0; }
  var seed = 4242; function rnd() { seed = seed + 0x6D2B79F5 | 0; var x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }
  var S = { t: 0, agents: {}, session: { runs: 0, tokens: 0, cost: 0 }, tpm: [], events: [], paused: false };
  D.agents.forEach(function (a, i) {
    var b = base(a, a.status);
    S.agents[a.id] = { status: a.status, home: a.status, ttl: 0, w: 1, tps: b, lat: a.status === 'running' ? 380 + (i * 53) % 700 : null,
      hist: Array.from({ length: 24 }, function (_, k) { return b ? Math.max(1, Math.round(b * (0.75 + 0.5 * Math.abs(Math.sin(i + k * 0.7))))) : 0; }) };
  });
  function fleetTps() { var s = 0; for (var id in S.agents) s += S.agents[id].tps; return s; }
  var wk = 1; for (var k = 0; k < 30; k++) { wk = Math.min(1.25, Math.max(0.75, wk + (rnd() - 0.5) * 0.16)); S.tpm.push(Math.round(fleetTps() * 60 * wk * (0.94 + rnd() * 0.12) + (rnd() < 0.08 ? fleetTps() * 25 * rnd() : 0))); }
  function running() { var n = 0; for (var id in S.agents) if (S.agents[id].status === 'running') n++; return n; }
  function push(a, lvl, msg) { var t = new Date(D.TODAY.getTime() + S.t * 1000); S.events.push({ t: t, id: a.id, name: a.name, lvl: lvl, msg: msg }); if (S.events.length > 150) S.events.shift(); }
  function tick() {
    if (S.paused) return; S.t++;
    var t = S.t;
    D.agents.forEach(function (a, i) {
      var L = S.agents[a.id], h = (t * 7 + i * 13) % 29;
      if (L.home === 'idle' && L.status === 'idle' && h === 0) { L.status = 'running'; L.ttl = 4 + i % 4; push(a, 'INFO', 'picked up job · ' + task(a, 'running')); }
      else if (L.ttl > 0 && --L.ttl === 0) { var was = L.status; L.status = L.home; if (was === 'deploying') push(a, 'INFO', 'restart complete · ' + L.home); else { S.session.runs++; push(a, 'INFO', 'job complete · back to ' + L.home); } }
      if (L.home === 'running' && L.status === 'running' && h === 11) { S.session.runs++; push(a, 'INFO', 'run complete · ' + task(a)); }
      var b = base(a, L.status);
      L.w = Math.min(1.3, Math.max(0.7, L.w + (rnd() - 0.5) * 0.18)); L.tps = b ? Math.max(1, Math.round(b * L.w * (0.9 + rnd() * 0.2))) : 0;
      L.lat = L.status === 'running' ? Math.round(380 + (i * 53) % 400 + rnd() * 260 + (rnd() < 0.05 ? 500 : 0)) : null;
      L.hist.push(L.tps); L.hist.shift();
      S.session.tokens += L.tps; S.session.cost += L.tps * D.model(a.model).price / 1e6;
    });
    var act = D.agents.filter(function (a) { return S.agents[a.id].status !== 'paused'; }), a = act[t % act.length], L = S.agents[a.id];
    if (L.status === 'error') push(a, 'ERROR', task(a, 'error'));
    else if (L.status === 'running' && t % 9 === 4) push(a, 'WARN', 'latency ' + (L.lat + 240) + ' ms above p95');
    else if (L.status === 'running') push(a, 'INFO', task(a, 'running') + ' · ' + L.tps + ' tok/s');
    else if (L.status === 'deploying') push(a, 'INFO', 'health check 2/3');
    else push(a, 'INFO', 'heartbeat ok · ' + L.status);
    S.tpm.push(fleetTps() * 60); S.tpm.shift();
    window.dispatchEvent(new CustomEvent('om:tick', { detail: S }));
  }
  for (var w = 0; w < 14; w++) { var a0 = D.agents[w], L0 = S.agents[a0.id]; push(a0, L0.status === 'error' ? 'ERROR' : 'INFO', task(a0) + (L0.tps ? ' · ' + L0.tps + ' tok/s' : '')); }
  var timer = null;
  D.Live = {
    state: S, task: task, running: running, fleetTps: fleetTps,
    start: function () { if (!timer) timer = nativeSetInterval(tick, 1000); },
    stop: function () { if (timer) { nativeClear(timer); timer = null; } },
    isRunning: function () { return !!timer; },
    setPaused: function (p) { S.paused = !!p; },
    // operator actions from the monitor drawer: they change the live status the tiles, strip and swarm read
    act: function (id, what) { var a = D.agent(id), L = S.agents[id]; if (!a || !L) return;
      if (what === 'pause') { L.status = L.home = 'paused'; L.ttl = 0; push(a, 'WARN', 'paused by operator'); }
      else if (what === 'resume') { L.status = L.home = a.status === 'paused' ? 'idle' : a.status; L.ttl = 0; push(a, 'INFO', 'resumed by operator · ' + L.home); }
      else if (what === 'restart') { L.home = 'running'; L.status = 'deploying'; L.ttl = 3; push(a, 'INFO', 'restart requested · redeploying'); }
      else if (what === 'kill') { L.status = L.home = 'idle'; L.ttl = 0; push(a, 'ERROR', 'killed by operator · run cancelled'); }
      var b = base(a, L.status); L.tps = b; L.lat = L.status === 'running' ? 420 : null;
      window.dispatchEvent(new CustomEvent('om:tick', { detail: S })); }
  };
})();
