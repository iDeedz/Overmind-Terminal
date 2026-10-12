/* Overmind Terminal — number book (single source of truth).
 * Every count, cost and total in the kit is derived from the arrays below.
 * "Today" is fixed so the demo stays deterministic. */
(function () {
  'use strict';
  var TODAY = new Date('2026-10-12T14:00:00+02:00');
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var r = rng(4242);
  function pick(a) { return a[Math.floor(r() * a.length)]; }
  function daysAgo(n, h, m) { var d = new Date(TODAY.getTime() - n * 864e5); if (h != null) d.setHours(h, m || 0, 0, 0); return d; }

  var providers = [
    { id: 'helios', name: 'Helios AI', region: 'eu-west', status: 'operational', latency: 412, uptime: 99.98 },
    { id: 'lyra', name: 'Lyra Labs', region: 'us-east', status: 'operational', latency: 538, uptime: 99.95 },
    { id: 'forge', name: 'Forge (self-hosted)', region: 'af-south', status: 'degraded', latency: 289, uptime: 99.61 },
    { id: 'northwind', name: 'Northwind Cloud', region: 'eu-central', status: 'operational', latency: 365, uptime: 99.97 }
  ];
  // price = blended USD per 1M tokens
  var models = [
    { id: 'orion-4', name: 'Orion 4', provider: 'helios', ctx: 256, price: 6.0, kind: 'chat', color: '#4ef0c3' },
    { id: 'orion-4-mini', name: 'Orion 4 Mini', provider: 'helios', ctx: 128, price: 0.9, kind: 'chat', color: '#7dd3fc' },
    { id: 'lyra-3-opus', name: 'Lyra 3 Opus', provider: 'lyra', ctx: 200, price: 12.0, kind: 'chat', color: '#c4b5fd' },
    { id: 'lyra-3-swift', name: 'Lyra 3 Swift', provider: 'lyra', ctx: 200, price: 1.6, kind: 'chat', color: '#f9a8d4' },
    { id: 'atlas-70b', name: 'Atlas 70B', provider: 'forge', ctx: 64, price: 0.4, kind: 'chat', color: '#fcd34d' },
    { id: 'kestrel-vision', name: 'Kestrel Vision', provider: 'northwind', ctx: 96, price: 4.0, kind: 'vision', color: '#fdba74' },
    { id: 'nova-embed-2', name: 'Nova Embed 2', provider: 'northwind', ctx: 8, price: 0.1, kind: 'embedding', color: '#a3e635' }
  ];
  var team = [
    { id: 'u1', name: 'Mr Deedz', email: 'deedz@deedz.dev', role: 'Owner', status: 'online', last: 0 },
    { id: 'u2', name: 'Thandi Mokoena', email: 'thandi@deedz.dev', role: 'Admin', status: 'online', last: 4 },
    { id: 'u3', name: 'Ruan Venter', email: 'ruan@deedz.dev', role: 'Engineer', status: 'online', last: 12 },
    { id: 'u4', name: 'Aisha Patel', email: 'aisha@deedz.dev', role: 'Engineer', status: 'away', last: 47 },
    { id: 'u5', name: 'Sipho Ndlovu', email: 'sipho@deedz.dev', role: 'Prompt engineer', status: 'online', last: 2 },
    { id: 'u6', name: 'Lena Fischer', email: 'lena@deedz.dev', role: 'Analyst', status: 'offline', last: 1440 },
    { id: 'u7', name: 'Kofi Mensah', email: 'kofi@deedz.dev', role: 'Viewer', status: 'offline', last: 2880 },
    { id: 'u8', name: 'Mia Jacobs', email: 'mia@deedz.dev', role: 'Engineer', status: 'away', last: 95 }
  ];
  var toolNames = ['web.search', 'code.exec', 'sql.query', 'http.fetch', 'files.read', 'files.write', 'mail.send', 'slack.post', 'github.pr', 'calendar', 'vector.search', 'browser', 'pdf.parse', 'image.gen'];
  var specs = [
    ['Atlas Scout', 'Research', 'running', 'orion-4'], ['Ledger', 'Finance ops', 'running', 'lyra-3-swift'],
    ['Triage-7', 'Support triage', 'running', 'orion-4-mini'], ['Quill', 'Content writer', 'running', 'lyra-3-opus'],
    ['Sentinel', 'Security watch', 'running', 'orion-4'], ['Cartographer', 'Data mapping', 'idle', 'atlas-70b'],
    ['Forgesmith', 'Code review', 'running', 'lyra-3-opus'], ['Echo', 'Voice summariser', 'running', 'orion-4-mini'],
    ['Harbor', 'DevOps on-call', 'error', 'orion-4'], ['Mosaic', 'Image tagging', 'running', 'kestrel-vision'],
    ['Nimbus', 'Cloud cost', 'idle', 'atlas-70b'], ['Oracle Desk', 'Internal Q&A', 'running', 'orion-4'],
    ['Pulse', 'Social listening', 'paused', 'lyra-3-swift'], ['Relay', 'Ticket router', 'running', 'orion-4-mini'],
    ['Sable', 'Legal redline', 'deploying', 'lyra-3-opus'], ['Tally', 'Invoice parser', 'running', 'kestrel-vision'],
    ['Umbra', 'Red-team tester', 'idle', 'lyra-3-opus'], ['Vector', 'Embedding indexer', 'running', 'nova-embed-2'],
    ['Warden', 'Policy guard', 'running', 'orion-4-mini'], ['Yield', 'Sales forecaster', 'error', 'atlas-70b'],
    ['Zephyr', 'Travel planner', 'paused', 'lyra-3-swift'], ['Kiln', 'Test generator', 'deploying', 'orion-4'],
    ['Juno', 'Onboarding guide', 'idle', 'orion-4-mini'], ['Iris', 'Meeting notes', 'running', 'lyra-3-swift']
  ];
  var agents = specs.map(function (s, i) {
    var m = models.filter(function (x) { return x.id === s[3]; })[0];
    var tokens = Math.round((0.6 + r() * 9.4) * 1e6 / 1000) * 1000; // 0.6M–10M per 30d
    if (m.price >= 12) tokens = Math.round(tokens * 0.35 / 1000) * 1000;
    var runs = 120 + Math.floor(r() * 1800);
    var cost = Math.round(tokens / 1e6 * m.price * 100) / 100;
    var tools = []; var n = 2 + Math.floor(r() * 4);
    while (tools.length < n) { var t = pick(toolNames); if (tools.indexOf(t) < 0) tools.push(t); }
    var uptime = s[2] === 'error' ? 96.1 + Math.round(r() * 20) / 10 : s[2] === 'paused' ? 0 : 99 + Math.round(r() * 99) / 100;
    return {
      id: 'AG-' + String(i + 1).padStart(2, '0'), name: s[0], role: s[1], status: s[2], model: s[3],
      tokens: tokens, runs: runs, cost: cost, uptime: Math.round(uptime * 100) / 100,
      lastRun: s[2] === 'paused' ? 60 * (26 + i) : Math.floor(r() * 55) + 1,
      owner: team[1 + (i % 7)].name, tools: tools, temp: Math.round((0.1 + r() * 0.8) * 10) / 10,
      successRate: s[2] === 'error' ? 88.4 + Math.round(r() * 30) / 10 : 97 + Math.round(r() * 29) / 10,
      memory: 40 + Math.floor(r() * 900), version: 'v' + (1 + Math.floor(r() * 4)) + '.' + Math.floor(r() * 10)
    };
  });

  // 30-day daily series; distributes fleet totals exactly (remainder lands on the last day)
  var weights = []; for (var d = 0; d < 30; d++) weights.push(0.7 + r() * 0.6 + d * 0.012);
  function spread(total, step) {
    var sw = weights.reduce(function (a, b) { return a + b; }, 0), out = [], acc = 0;
    weights.forEach(function (w, i) { var v = i === 29 ? Math.round((total - acc) / step) * step : Math.round(total * w / sw / step) * step; out.push(v); acc += v; });
    return out;
  }
  var sum = function (a, f) { return a.reduce(function (s, x) { return s + (f ? f(x) : x); }, 0); };
  var totals = {
    agents: agents.length,
    tokens: sum(agents, function (a) { return a.tokens; }),
    runs: sum(agents, function (a) { return a.runs; }),
    cost: Math.round(sum(agents, function (a) { return a.cost * 100; })) / 100,
    budget: 500
  };
  ['running', 'idle', 'paused', 'error', 'deploying'].forEach(function (s) { totals[s] = agents.filter(function (a) { return a.status === s; }).length; });
  var days = []; for (var k = 29; k >= 0; k--) days.push(daysAgo(k));
  var dailyCostCents = spread(Math.round(totals.cost * 100), 1);
  var daily = days.map(function (dt, i) { return { date: dt, cost: dailyCostCents[i] / 100 }; });
  var dailyTokens = spread(totals.tokens, 1000); daily.forEach(function (x, i) { x.tokens = dailyTokens[i]; });
  var dailyRuns = spread(totals.runs, 1); daily.forEach(function (x, i) { x.runs = dailyRuns[i]; });
  var byModel = models.map(function (m) {
    var as = agents.filter(function (a) { return a.model === m.id; });
    return { id: m.id, name: m.name, color: m.color, agents: as.length, tokens: sum(as, function (a) { return a.tokens; }), cost: Math.round(sum(as, function (a) { return a.cost * 100; })) / 100 };
  });
  var byProvider = providers.map(function (p) {
    var ms = byModel.filter(function (b) { return models.filter(function (m) { return m.id === b.id; })[0].provider === p.id; });
    return { id: p.id, name: p.name, cost: Math.round(sum(ms, function (b) { return b.cost * 100; })) / 100, tokens: sum(ms, function (b) { return b.tokens; }), agents: sum(ms, function (b) { return b.agents; }) };
  });

  var runStatus = ['success', 'success', 'success', 'success', 'success', 'success', 'failed', 'running', 'success', 'cancelled'];
  var runs = [];
  for (var j = 0; j < 40; j++) {
    var st = j < 3 ? 'running' : pick(runStatus); if (st === 'running' && j >= 3) st = 'success';
    var pool = agents.filter(function (x) { return st === 'running' ? x.status === 'running' : x.status !== 'paused'; });
    var a = pool[Math.floor(r() * pool.length)];
    if (j === 3) { a = agents[0]; st = 'success'; }
    if (j === 4) { a = agents[8]; st = 'failed'; }   // Harbor: the run behind its timeout alert
    if (j === 5) { a = agents[19]; st = 'failed'; }  // Yield: the run behind its 502 alert
    var mins = j * 37 + Math.floor(r() * 30);
    var tok = 800 + Math.floor(r() * 24000);
    var mm = models.filter(function (x) { return x.id === a.model; })[0];
    runs.push({ id: 'RUN-' + (88412 - j), agent: a.id, agentName: a.name, model: a.model, status: st,
      started: new Date(TODAY.getTime() - mins * 60000), duration: 900 + Math.floor(r() * 42000),
      tokens: tok, cost: Math.round(tok / 1e6 * mm.price * 10000) / 10000, steps: 3 + Math.floor(r() * 9),
      trigger: pick(['terminal', 'schedule', 'webhook', 'workflow', 'api']) });
  }
  // RUN-88409 is the flagship trace (see trace below): keep the row identical to it
  Object.assign(runs[3], { duration: 8420, tokens: 8050, cost: 0.0856, steps: 11, trigger: 'terminal' });
  // last run of each agent = its newest run in the recent window; others ran before the window
  var oldest = Math.ceil((TODAY - runs[runs.length - 1].started) / 60000);
  agents.forEach(function (ag, i) {
    var mine = runs.filter(function (x) { return x.agent === ag.id; });
    if (mine.length) ag.lastRun = Math.max(1, Math.round((TODAY - mine[0].started) / 60000));
    else if (ag.status !== 'paused') ag.lastRun = oldest + 20 + i * 41;
  });
  // The flagship trace (RUN-88409)
  var trace = { run: 'RUN-88409', total: 8420, spans: [
    { name: 'workflow.start', kind: 'system', start: 0, dur: 8420, depth: 0 },
    { name: 'planner · orion-4', kind: 'llm', start: 40, dur: 1310, depth: 1, tokens: 1840 },
    { name: 'vector.search · docs-core', kind: 'tool', start: 1380, dur: 220, depth: 1 },
    { name: 'web.search ×3', kind: 'tool', start: 1610, dur: 1940, depth: 1 },
    { name: 'http.fetch · pricing page', kind: 'tool', start: 1650, dur: 760, depth: 2 },
    { name: 'http.fetch · changelog', kind: 'tool', start: 1660, dur: 1120, depth: 2 },
    { name: 'guardrail · pii-scan', kind: 'guard', start: 3580, dur: 180, depth: 1 },
    { name: 'synthesise · lyra-3-opus', kind: 'llm', start: 3790, dur: 3420, depth: 1, tokens: 6210 },
    { name: 'code.exec · chart.py', kind: 'tool', start: 7240, dur: 690, depth: 1 },
    { name: 'slack.post · #research', kind: 'tool', start: 7960, dur: 380, depth: 1 },
    { name: 'workflow.end', kind: 'system', start: 8360, dur: 60, depth: 0 }
  ] };
  var alerts = [
    { id: 'AL-311', sev: 'critical', title: 'Harbor: tool timeout loop on k8s.rollout', agent: 'AG-09', at: 18, state: 'open' },
    { id: 'AL-310', sev: 'high', title: 'Yield: Atlas 70B returning 502 from Forge', agent: 'AG-20', at: 42, state: 'open' },
    { id: 'AL-309', sev: 'medium', title: 'Forge provider latency above 250 ms p95', agent: null, at: 95, state: 'open' },
    { id: 'AL-308', sev: 'medium', title: 'Fleet spend above 75% of monthly budget', agent: null, at: 180, state: 'acknowledged' },
    { id: 'AL-307', sev: 'low', title: 'Quill: prompt v3.2 drift score 0.18', agent: 'AG-04', at: 310, state: 'acknowledged' },
    { id: 'AL-306', sev: 'high', title: 'Key hx-live (ends 9f2c) expires in 6 days', agent: null, at: 540, state: 'open' },
    { id: 'AL-305', sev: 'low', title: 'Vector: docs-core reindex finished with 14 skips', agent: 'AG-18', at: 900, state: 'resolved' },
    { id: 'AL-304', sev: 'medium', title: 'Warden blocked 23 outputs for PII', agent: 'AG-19', at: 1320, state: 'resolved' },
    { id: 'AL-303', sev: 'low', title: 'Kiln: deploy queued behind Sable', agent: 'AG-22', at: 1800, state: 'resolved' }
  ];
  var keys = [
    { name: 'Helios production', provider: 'helios', key: 'hx-live-7c1d8e2f9f2c', created: 182, used: 1, scope: 'all agents', expires: 6 },
    { name: 'Lyra production', provider: 'lyra', key: 'ly-prod-a91b33d0e4c7', created: 140, used: 2, scope: 'all agents', expires: 225 },
    { name: 'Forge cluster token', provider: 'forge', key: 'fg-tok-55e1c09ab218', created: 96, used: 1, scope: 'Cartographer, Nimbus, Yield', expires: 269 },
    { name: 'Northwind vision', provider: 'northwind', key: 'nw-key-0bd4f7e6a3c5', created: 61, used: 4, scope: 'Mosaic, Tally', expires: 304 },
    { name: 'Slack bot', provider: 'slack', key: 'xoxb-1188-4f0a2de9b7', created: 220, used: 9, scope: 'tool: slack.post', expires: null },
    { name: 'GitHub app', provider: 'github', key: 'ghs_3d9f0a71be52c4', created: 33, used: 22, scope: 'tool: github.pr', expires: 57 },
    { name: 'Staging sandbox', provider: 'helios', key: 'hx-test-11aa90cd7e01', created: 12, used: 640, scope: 'staging only', expires: 78 }
  ];
  var tools = toolNames.map(function (t, i) {
    return { id: t, desc: ['Search the public web', 'Run sandboxed Python', 'Read-only SQL on warehouse', 'GET/POST any allowed URL', 'Read workspace files', 'Write workspace files', 'Send email via SMTP relay', 'Post to Slack channels', 'Open and review pull requests', 'Read/write calendar events', 'Query vector stores', 'Headless browser session', 'Extract text from PDFs', 'Generate images'][i],
      agents: agents.filter(function (a) { return a.tools.indexOf(t) >= 0; }).length,
      risk: ['low', 'high', 'medium', 'medium', 'low', 'high', 'medium', 'low', 'medium', 'low', 'low', 'high', 'low', 'medium'][i],
      enabled: i !== 13 };
  });
  tools.forEach(function (t) { t.calls = t.agents * (310 + toolNames.indexOf(t.id) * 47); });
  var integrations = [
    ['Slack', 'Messaging', true], ['GitHub', 'Code', true], ['Linear', 'Issues', true], ['Notion', 'Docs', false], ['Google Drive', 'Files', true], ['Postgres', 'Database', true],
    ['Stripe', 'Billing', false], ['Zendesk', 'Support', true], ['Jira', 'Issues', false], ['S3', 'Storage', true], ['Discord', 'Messaging', false], ['Webhooks', 'Custom', true]
  ].map(function (x) { return { name: x[0], cat: x[1], connected: x[2] }; });
  var stores = [
    { id: 'docs-core', name: 'Product docs', docs: 1284, chunks: 48210, dims: 1536, size: 412, synced: 22 },
    { id: 'support-kb', name: 'Support macros', docs: 640, chunks: 12890, dims: 1536, size: 108, synced: 64 },
    { id: 'legal-vault', name: 'Contracts vault', docs: 312, chunks: 30440, dims: 1536, size: 287, synced: 300 },
    { id: 'code-index', name: 'Monorepo index', docs: 9120, chunks: 186300, dims: 1024, size: 1630, synced: 9 },
    { id: 'meetings', name: 'Meeting transcripts', docs: 486, chunks: 21770, dims: 1024, size: 176, synced: 140 },
    { id: 'sales-notes', name: 'CRM notes', docs: 2210, chunks: 15420, dims: 1024, size: 131, synced: 1460 }
  ];
  var prompts = [
    ['Research brief', 'research', 'v3.1', 'Atlas Scout', 412], ['Support triage classifier', 'support', 'v5.0', 'Triage-7', 1840], ['Blog post outline', 'content', 'v3.2', 'Quill', 233],
    ['Code review checklist', 'engineering', 'v2.4', 'Forgesmith', 790], ['Invoice field extraction', 'finance', 'v1.9', 'Tally', 1102], ['Incident summary', 'ops', 'v2.0', 'Harbor', 96],
    ['Policy guard rubric', 'safety', 'v4.3', 'Warden', 2210], ['Meeting minutes', 'productivity', 'v1.6', 'Iris', 655], ['SQL from question', 'data', 'v2.2', 'Cartographer', 318],
    ['Contract redline', 'legal', 'v1.1', 'Sable', 41], ['Red-team jailbreak suite', 'safety', 'v0.9', 'Umbra', 77], ['Unit test writer', 'engineering', 'v1.4', 'Kiln', 128],
    ['Ticket routing rules', 'support', 'v3.0', 'Relay', 1390], ['Forecast narrative', 'finance', 'v1.0', 'Yield', 54], ['Cost anomaly explainer', 'ops', 'v1.3', 'Nimbus', 87],
    ['Onboarding FAQ', 'productivity', 'v2.1', 'Juno', 266], ['Image alt-text', 'content', 'v1.2', 'Mosaic', 940], ['Social sentiment', 'research', 'v2.0', 'Pulse', 180]
  ].map(function (p, i) { return { id: 'PR-' + (101 + i), name: p[0], tag: p[1], version: p[2], agent: p[3], uses: p[4], edited: 1 + i * 3 }; });
  var templates = [
    ['Research analyst', 'Multi-step web research with citations', 'orion-4', 4], ['Support triage', 'Classify, route and draft replies', 'orion-4-mini', 3],
    ['Code reviewer', 'Review PRs against your style guide', 'lyra-3-opus', 3], ['Data analyst', 'Natural language to SQL with charts', 'atlas-70b', 4],
    ['Doc Q&A', 'RAG over any vector store', 'orion-4', 2], ['Meeting scribe', 'Transcripts to minutes and actions', 'lyra-3-swift', 2],
    ['Policy guard', 'Moderate outputs before they ship', 'orion-4-mini', 1], ['Invoice parser', 'Vision OCR to structured JSON', 'kestrel-vision', 2],
    ['Release notes', 'Commits to a human changelog', 'lyra-3-swift', 2]
  ].map(function (t, i) { return { id: 'TP-' + (i + 1), name: t[0], desc: t[1], model: t[2], tools: t[3] }; });
  // failed = failed runs in the last 30 days; success rate is derived from runs/failed
  var workflows = [
    { id: 'WF-01', name: 'Daily market brief', nodes: 7, runs: 30, failed: 1, status: 'active', schedule: 'Daily 07:00' },
    { id: 'WF-02', name: 'Support inbox autopilot', nodes: 9, runs: 1840, failed: 31, status: 'active', schedule: 'On webhook' },
    { id: 'WF-03', name: 'PR review chain', nodes: 6, runs: 412, failed: 9, status: 'active', schedule: 'On PR opened' },
    { id: 'WF-04', name: 'Invoice to ledger', nodes: 5, runs: 1102, failed: 14, status: 'active', schedule: 'On email' },
    { id: 'WF-05', name: 'Weekly cost report', nodes: 4, runs: 4, failed: 0, status: 'paused', schedule: 'Mon 08:00' },
    { id: 'WF-06', name: 'Red-team nightly', nodes: 8, runs: 0, failed: 0, status: 'draft', schedule: 'Nightly 02:00' }
  ];
  workflows.forEach(function (w) { w.success = w.runs ? Math.round((w.runs - w.failed) / w.runs * 1000) / 10 : null; });
  // WF-02 graph: the pipeline builder renders this. layer = step (left→right), lane = row within the step
  workflows[1].graph = {
    nodes: [
      { id: 'n1', t: 'Trigger', k: 'webhook · ticket.new', layer: 0, lane: 0.5 },
      { id: 'n2', t: 'Triage-7', k: 'classify · orion-4-mini', layer: 1, lane: 0 },
      { id: 'n3', t: 'vector.search', k: 'support-kb · top 6', layer: 1, lane: 1 },
      { id: 'n4', t: 'Relay', k: 'route · orion-4-mini', layer: 2, lane: 0.5 },
      { id: 'n5', t: 'Warden', k: 'guardrail · pii-scan', layer: 3, lane: 0 },
      { id: 'n6', t: 'Draft reply', k: 'lyra-3-swift · tone', layer: 3, lane: 1 },
      { id: 'n7', t: 'Human review', k: 'if confidence < 0.7', layer: 4, lane: 0.5 },
      { id: 'n8', t: 'zendesk.reply', k: 'tool · send reply', layer: 5, lane: 0 },
      { id: 'n9', t: 'slack.post', k: '#support-log', layer: 5, lane: 1 }
    ],
    edges: [['n1', 'n2'], ['n1', 'n3'], ['n2', 'n4'], ['n3', 'n4'], ['n4', 'n5'], ['n4', 'n6'], ['n5', 'n7'], ['n6', 'n7'], ['n7', 'n8'], ['n7', 'n9']]
  };
  workflows[1].nodes = workflows[1].graph.nodes.length;
  var wfMap = { 'Atlas Scout': 'WF-01', 'Triage-7': 'WF-02', 'Relay': 'WF-02', 'Warden': 'WF-02', 'Forgesmith': 'WF-03', 'Kiln': 'WF-03', 'Tally': 'WF-04', 'Ledger': 'WF-04', 'Nimbus': 'WF-05', 'Umbra': 'WF-06' };
  agents.forEach(function (a) { a.workflow = wfMap[a.name] || null; });
  var evals = [
    { id: 'EV-1', name: 'Triage accuracy', agent: 'Triage-7', cases: 420, pass: 397, last: 2 },
    { id: 'EV-2', name: 'Research faithfulness', agent: 'Atlas Scout', cases: 120, pass: 109, last: 26 },
    { id: 'EV-3', name: 'Invoice field F1', agent: 'Tally', cases: 300, pass: 288, last: 50 },
    { id: 'EV-4', name: 'Jailbreak resistance', agent: 'Warden', cases: 250, pass: 241, last: 74 },
    { id: 'EV-5', name: 'Code review recall', agent: 'Forgesmith', cases: 90, pass: 71, last: 98 }
  ];
  var schedules = [
    ['Daily market brief', 'Atlas Scout', '0 7 * * *', 'Tomorrow 07:00'], ['Cost anomaly scan', 'Nimbus', '0 */6 * * *', 'Today 18:00'], ['Weekly cost report', 'Nimbus', '0 8 * * 1', 'Paused'],
    ['Nightly red-team', 'Umbra', '0 2 * * *', 'Tomorrow 02:00'], ['Reindex docs-core', 'Vector', '30 1 * * *', 'Tomorrow 01:30'], ['Forecast refresh', 'Yield', '0 9 * * 1-5', 'Tomorrow 09:00'], ['Inbox sweep', 'Relay', '*/15 * * * *', 'Today 14:15']
  ].map(function (s, i) { return { id: 'SC-' + (i + 1), name: s[0], agent: s[1], cron: s[2], next: s[3] }; });
  var audit = [
    ['Mr Deedz', 'deployed', 'Kiln v2.3', 6], ['Thandi Mokoena', 'rotated key', 'Lyra production', 34], ['Ruan Venter', 'edited prompt', 'Research brief v3.1', 71],
    ['Sipho Ndlovu', 'created agent', 'Sable', 140], ['Aisha Patel', 'paused agent', 'Zephyr', 260], ['Mr Deedz', 'raised budget', '$450 → $500', 1500],
    ['Mia Jacobs', 'connected', 'Zendesk', 2900], ['Thandi Mokoena', 'invited', 'kofi@deedz.dev', 4300], ['Ruan Venter', 'deleted store', 'old-faq', 7100]
  ].map(function (a, i) { return { who: a[0], what: a[1], target: a[2], at: a[3] }; });
  var notifications = alerts.slice(0, 5).map(function (a) { return { title: a.title, at: a.at, read: a.state !== 'open' }; })
    .concat([{ title: 'Sipho shared prompt "Policy guard rubric"', at: 400, read: true }, { title: 'Invoice #INV-2026-10 is ready', at: 2000, read: true }]);

  window.OM = { TODAY: TODAY, daysAgo: daysAgo, providers: providers, models: models, agents: agents, team: team, totals: totals, daily: daily,
    byModel: byModel, byProvider: byProvider, runs: runs, trace: trace, alerts: alerts, keys: keys, tools: tools, integrations: integrations,
    stores: stores, prompts: prompts, templates: templates, workflows: workflows, evals: evals, schedules: schedules, audit: audit, notifications: notifications,
    model: function (id) { return models.filter(function (m) { return m.id === id; })[0]; },
    agent: function (id) { return agents.filter(function (a) { return a.id === id; })[0]; },
    provider: function (id) { return providers.filter(function (p) { return p.id === id; })[0]; } };
  alerts.forEach(function (al) { if (!al.agent) return; var ag = agents.filter(function (x) { return x.id === al.agent; })[0]; if (al.at < ag.lastRun) al.at = ag.lastRun; });
  alerts.sort(function (a, b) { return a.at - b.at; }).forEach(function (al, i) { al.id = 'AL-' + (311 - i); });
  window.OM.alerts = alerts;
  window.OM.nextRunId = 'RUN-' + (parseInt(runs[0].id.slice(4), 10) + 1);
  window.OM.totals.openAlerts = alerts.filter(function (a) { return a.state === 'open'; }).length;
  window.OM.totals.storeDocs = sum(stores, function (s) { return s.docs; });
  window.OM.totals.storeChunks = sum(stores, function (s) { return s.chunks; });
})();
