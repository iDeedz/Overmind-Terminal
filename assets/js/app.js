/* Overmind Terminal — app shell, helpers, charts, overlays. */
(function () {
  'use strict';
  var D = window.OM;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---- icons (24px stroke) ---- */
  var P = {
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', term: 'M4 5h16v14H4zM8 10l3 2-3 2M13 15h4',
    bot: 'M12 3v3M7 8h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3zM9 13h.01M15 13h.01M9.5 17h5',
    plus: 'M12 5v14M5 12h14', play: 'M7 4l13 8-13 8z', spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
    split: 'M4 4h7v16H4zM13 4h7v16h-7z', book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',
    layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5', flow: 'M5 5h4v4H5zM15 15h4v4h-4zM15 5h4v4h-4zM9 7h6M17 9v6M7 9v8h8',
    db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5', wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
    plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4', list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    wave: 'M3 12h3l3-7 4 14 3-7h5', logs: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5', check: 'M4 12l5 5L20 6',
    clock: 'M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
    chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8', cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3',
    cloud: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z', key: 'M14 10a4 4 0 1 0-3.5 4L9 15.5V18H7v2H4v-3l6.4-6.4A4 4 0 0 0 14 10zM15.5 8.5h.01',
    card: 'M3 6h18v12H3zM3 10h18M7 15h3', users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18 14a6 6 0 0 1 4 7',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', scroll: 'M7 4h11v13a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-2h11M7 4a2 2 0 0 0-2 2v10',
    cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', palette: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8.5-9-8.5zM7.5 11h.01M10 7h.01M14.5 7h.01',
    lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4', rocket: 'M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5M9 15l-3-3c1.5-4 5-8 12-9-1 7-5 10.5-9 12zM15 9h.01',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4', sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z', more: 'M5 12h.01M12 12h.01M19 12h.01', x: 'M6 6l12 12M18 6L6 18',
    menu: 'M4 7h16M4 12h16M4 17h16', copy: 'M9 9h11v11H9zM5 15V4h11', eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    stop: 'M6 6h12v12H6z', pause: 'M7 5h3v14H7zM14 5h3v14h-3z', refresh: 'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
    upload: 'M12 16V4M7 9l5-5 5 5M4 20h16', download: 'M12 4v12M7 11l5 5 5-5M4 20h16', filter: 'M4 5h16l-6 8v6l-4-2v-4z', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', flag: 'M5 21V4h11l-2 4 2 4H5'
  };
  function icon(n, cls) { return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (P[n] || P.spark) + '"/></svg>'; }
  var LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2l15.6 9v18L20 38 4.4 29V11z" fill="none" style="stroke:var(--accent)" stroke-width="2.4"/><circle cx="20" cy="20" r="7.5" fill="none" style="stroke:var(--violet)" stroke-width="2.4"/><circle cx="20" cy="20" r="2.6" style="fill:var(--accent)"/><path d="M20 2v10.5M35.6 29l-9.1-5.2M4.4 29l9.1-5.2" style="stroke:var(--violet)" stroke-width="2"/></svg>';

  /* ---- formatting ---- */
  var F = {
    int: function (n) { return Math.round(n).toLocaleString('en-US'); },
    money: function (n, d) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }); },
    tok: function (n) { return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 1 : 2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n); },
    ago: function (mins) { if (mins < 1) return 'just now'; if (mins < 60) return mins + 'm ago'; if (mins < 1440) return Math.floor(mins / 60) + 'h ago'; return Math.floor(mins / 1440) + 'd ago'; },
    date: function (d) { return String(d.getDate()).padStart(2, '0') + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; },
    time: function (d) { return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); },
    ms: function (n) { return n >= 1000 ? (n / 1000).toFixed(2) + ' s' : n + ' ms'; },
    pct: function (n, d) { return Number(n).toFixed(d == null ? 1 : d) + '%'; }
  };

  /* ---- building blocks ---- */
  function badge(s, label) { return '<span class="badge b-' + esc(s) + '">' + esc(label || s) + '</span>'; }
  function kpi(l, v, s, key) { return '<div class="panel kpi"><div class="l">' + esc(l) + '</div><div class="v"' + (key ? ' data-kpi="' + key + '"' : '') + '>' + v + '</div><div class="s">' + (s || '') + '</div></div>'; }
  function panel(title, body, opts) {
    opts = opts || {};
    return '<section class="panel ' + (opts.cls || '') + '"' + (opts.id ? ' id="' + opts.id + '"' : '') + '><div class="panel-h"><h3>' + title + '</h3>' + (opts.sub ? '<span class="sub">' + opts.sub + '</span>' : '') +
      (opts.tools ? '<div class="tools">' + opts.tools + '</div>' : '') + '</div><div class="panel-b ' + (opts.flush ? 'flush' : '') + '">' + body + '</div></section>';
  }
  function table(cols, rows, opts) {
    opts = opts || {};
    var h = '<div class="table-wrap"><table class="t"' + (opts.id ? ' id="' + opts.id + '"' : '') + '><thead><tr>' + cols.map(function (c) { return '<th' + (c.num ? ' class="num"' : '') + '>' + esc(c.label || c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    h += rows.map(function (r) { return '<tr>' + r.map(function (cell, i) { return '<td' + (cols[i] && cols[i].num ? ' class="num"' : '') + '>' + cell + '</td>'; }).join('') + '</tr>'; }).join('');
    return h + '</tbody></table></div>' + (rows.length ? '' : empty('Nothing here yet', opts.emptyText || 'No rows match.'));
  }
  function empty(t, d, action) { return '<div class="empty"><div class="glyph">' + icon('search') + '</div><h4>' + esc(t) + '</h4><div>' + esc(d) + '</div>' + (action || '') + '</div>'; }
  function head(eyebrow, title, desc, actions) { return '<header class="page-head"><div><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>' + (actions ? '<div class="actions">' + actions + '</div>' : '') + '</header>'; }
  function btn(label, opts) {
    opts = opts || {};
    var attrs = (opts.toast ? ' data-toast="' + esc(opts.toast) + '"' : '') + (opts.modal ? ' data-modal="' + esc(opts.modal) + '"' : '') + (opts.id ? ' id="' + opts.id + '"' : '') + (opts.attrs || '');
    if (opts.href) return '<a class="btn ' + (opts.cls || '') + '" href="' + opts.href + '"' + attrs + '>' + (opts.icon ? icon(opts.icon) : '') + esc(label) + '</a>';
    return '<button type="button" class="btn ' + (opts.cls || '') + '"' + attrs + '>' + (opts.icon ? icon(opts.icon) : '') + esc(label) + '</button>';
  }

  /* ---- charts (SVG) ---- */
  function niceMax(v) { if (v <= 0) return 1; var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
  function chartW(o) {
    if (!o.span) return o.w || 720; var vw = window.innerWidth, span = vw <= 1180 && o.span >= 4 ? 12 : o.span;
    var c = vw - (vw >= 1024 ? 248 + 48 : 28); return Math.max(300, Math.round(c * span / 12 - 34 - (span < 12 ? 8 : 0)));
  }
  function lineChart(o) {
    var W = chartW(o), H = o.h || 260, L = o.left || 56, R = 18, T = 18, B = 34, iw = W - L - R, ih = H - T - B;
    var all = []; o.series.forEach(function (s) { all = all.concat(s.values); }); if (o.target) all.push(o.target.value);
    var max = niceMax(Math.max.apply(null, all) * 1.08), n = o.labels.length, fmt = o.fmt || F.int;
    var x = function (i) { return L + (n === 1 ? iw / 2 : i * iw / (n - 1)); }, y = function (v) { return T + ih - v / max * ih; };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'line chart') + '">';
    for (var k = 0; k <= 4; k++) { var v = max * k / 4, yy = y(v); s += '<line class="gridl" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/><text x="' + (L - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + fmt(v) + '</text>'; }
    s += '<line class="axis" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (T + ih) + '"/><line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + ih) + '" y2="' + (T + ih) + '"/>';
    var every = o.every || Math.ceil(n / Math.max(2, Math.floor(iw / 66)));
    o.labels.forEach(function (lb, i) { if ((i % every === 0 && (n - 1 - i >= every || i === 0)) || i === n - 1) s += '<text x="' + x(i) + '" y="' + (H - 12) + '" text-anchor="' + (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle') + '">' + esc(lb) + '</text>'; });
    if (o.target) { var ty = y(o.target.value); s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + ty + '" y2="' + ty + '" stroke="var(--amber)" stroke-dasharray="6 4" stroke-width="1.5"/>'; }
    o.series.forEach(function (se) {
      var pts = se.values.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
      if (se.area) s += '<path d="M' + x(0) + ',' + (T + ih) + ' L' + pts.join(' L') + ' L' + x(n - 1) + ',' + (T + ih) + 'Z" fill="' + se.color + '" opacity=".12"/>';
      s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + se.color + '" stroke-width="2.2" stroke-linejoin="round"/>';
      var li = n - 1, lv = se.values[li]; s += '<circle cx="' + x(li) + '" cy="' + y(lv) + '" r="4" fill="' + se.color + '"/>';
      var mi = se.values.indexOf(Math.max.apply(null, se.values)); s += '<circle cx="' + x(mi) + '" cy="' + y(se.values[mi]) + '" r="3.5" fill="' + se.color + '"/><text class="val" x="' + Math.min(Math.max(x(mi), L + 30), W - R - 30) + '" y="' + Math.max(y(se.values[mi]) - 9, 12) + '" text-anchor="middle">' + fmt(se.values[mi]) + '</text>';
    });
    s += '</svg>';
    var leg = o.series.map(function (se) { return '<span><i style="background:' + se.color + '"></i>' + esc(se.name) + (se.total != null ? ' · <b class="mono">' + se.total + '</b>' : '') + '</span>'; }).join('');
    if (o.target) leg += '<span><i style="background:var(--amber)"></i>' + esc(o.target.label) + '</span>';
    return '<div class="chart">' + s + '<div class="legend">' + leg + '</div></div>';
  }
  function hBar(o, W) {
    var n = o.labels.length, fmt = o.fmt || F.int, L = 8 + 7 * Math.max.apply(null, o.labels.map(function (x) { return String(x).length; })), R = 58, T = 8, row = 30, H = T + n * row + 30, iw = W - L - R, max = o.max || niceMax(Math.max.apply(null, o.values) * 1.05);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'bar chart') + '">';
    for (var k = 0; k <= 2; k++) { var x = L + iw * k / 2; s += '<line class="gridl" x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (T + n * row) + '"/><text x="' + x + '" y="' + (H - 8) + '" text-anchor="' + (k === 0 ? 'start' : k === 2 ? 'end' : 'middle') + '">' + fmt(max * k / 2) + '</text>'; }
    s += '<line class="axis" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (T + n * row) + '"/>';
    o.values.forEach(function (v, i) { var y = T + i * row, w = v / max * iw, c = (o.colors && o.colors[i]) || o.color || 'var(--accent)'; var lb = String(o.labels[i]); 
      s += '<text x="' + (L - 8) + '" y="' + (y + 19) + '" text-anchor="end">' + esc(lb) + '</text><rect x="' + L + '" y="' + (y + 7) + '" width="' + Math.max(w, 1) + '" height="16" rx="3" fill="' + c + '"/><text class="val" x="' + (L + w + 6) + '" y="' + (y + 19) + '">' + fmt(v) + '</text>'; });
    return '<div class="chart">' + s + '</svg>' + (o.legend ? '<div class="legend">' + o.legend + '</div>' : '') + '</div>';
  }
  function barChart(o) {
    var W = chartW(o); if (W < 560 && o.labels.length > 4) return hBar(o, W);
    var H = o.h || 260, L = o.left || 56, R = 14, T = 22, B = 40, iw = W - L - R, ih = H - T - B, n = o.labels.length, fmt = o.fmt || F.int;
    var max = o.max || niceMax(Math.max.apply(null, o.values) * 1.1), bw = iw / n * 0.62;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'bar chart') + '">';
    for (var k = 0; k <= 4; k++) { var v = max * k / 4, yy = T + ih - v / max * ih; s += '<line class="gridl" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/><text x="' + (L - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + fmt(v) + '</text>'; }
    s += '<line class="axis" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (T + ih) + '"/><line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + ih) + '" y2="' + (T + ih) + '"/>';
    o.values.forEach(function (v, i) {
      var cx = L + iw / n * (i + .5), h = v / max * ih, c = (o.colors && o.colors[i]) || o.color || 'var(--accent)';
      s += '<rect x="' + (cx - bw / 2) + '" y="' + (T + ih - h) + '" width="' + bw + '" height="' + Math.max(h, 1) + '" rx="3" fill="' + c + '"/>';
      if (o.showValues !== false) s += '<text class="val" x="' + cx + '" y="' + (T + ih - h - 6) + '" text-anchor="middle">' + fmt(v) + '</text>';
      s += '<text x="' + cx + '" y="' + (H - 16) + '" text-anchor="middle">' + esc(o.labels[i]) + '</text>';
    });
    s += '<text x="' + (W - R) + '" y="' + (H - 2) + '" text-anchor="end">' + esc(o.xTitle || '') + '</text></svg>';
    return '<div class="chart">' + s + (o.legend ? '<div class="legend">' + o.legend + '</div>' : '') + '</div>';
  }
  function donut(o) {
    var tot = o.items.reduce(function (a, b) { return a + b.value; }, 0), a0 = -Math.PI / 2, s = '<svg viewBox="0 0 120 120" role="img" aria-label="' + esc(o.title || 'donut') + '">';
    o.items.forEach(function (it) {
      if (!it.value) return; var a1 = a0 + it.value / tot * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0;
      var p = function (a, r) { return (60 + r * Math.cos(a)).toFixed(2) + ' ' + (60 + r * Math.sin(a)).toFixed(2); };
      s += '<path d="M' + p(a0, 52) + ' A52 52 0 ' + big + ' 1 ' + p(a1 - 0.0001, 52) + ' L' + p(a1 - 0.0001, 34) + ' A34 34 0 ' + big + ' 0 ' + p(a0, 34) + 'Z" fill="' + it.color + '"/>'; a0 = a1;
    });
    s += '<text x="60" y="58" text-anchor="middle" style="font:700 14px var(--mono);fill:var(--text)">' + esc(o.center) + '</text><text x="60" y="73" text-anchor="middle" style="font:10px var(--mono);fill:var(--muted)">' + esc(o.centerSub || '') + '</text></svg>';
    var leg = '<div class="legend" style="flex-direction:column;margin:0">' + o.items.map(function (it) { return '<span><i style="background:' + it.color + '"></i>' + esc(it.name) + ' · <b class="mono">' + (o.fmt || F.int)(it.value) + '</b> <span class="muted">(' + (it.value / tot * 100).toFixed(1) + '%)</span></span>'; }).join('') + '</div>';
    return '<div class="chart donut-wrap">' + s + leg + '</div>';
  }

  /* ---- overlays ---- */
  function toast(msg, kind) {
    var box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    var t = document.createElement('div'); t.className = 'toast'; if (kind === 'error') t.style.borderLeftColor = 'var(--red)';
    t.innerHTML = icon(kind === 'error' ? 'x' : 'check') + '<div>' + esc(msg) + '</div>'; box.appendChild(t); while (box.children.length > 3) box.firstChild.remove();
    setTimeout(function () { t.remove(); }, 3200);
  }
  function modal(title, body, actions) {
    closeOverlays();
    var s = document.createElement('div'); s.className = 'scrim'; s.setAttribute('data-overlay', '');
    s.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal-h"><h3>' + esc(title) + '</h3><button class="icon-btn" style="margin-left:auto" data-close aria-label="Close">' + icon('x') + '</button></div><div class="modal-b">' + body + '</div><div class="modal-f">' +
      (actions || '<button class="btn" data-close>Cancel</button><button class="btn primary" data-close data-toast="Saved">Confirm</button>') + '</div></div>';
    document.body.appendChild(s); var f = $('input,textarea,select,button.primary', s); if (f) f.focus();
    return s;
  }
  function closeOverlays() { $$('[data-overlay]').forEach(function (e) { e.remove(); }); }
  function nav(href) { if (window.__OM_NONAV) { window.__OM_LASTNAV = href; return; } go(href, true); }

  /* ---- navigation model ---- */
  var NAV = [
    ['Command', [['index', 'Overview', 'grid'], ['terminal', 'Terminal', 'term'], ['agents', 'Agent fleet', 'bot', D.totals.agents], ['create-agent', 'Create agent', 'plus']]],
    ['Build', [['playground', 'Playground', 'spark'], ['compare', 'Compare models', 'split'], ['prompts', 'Prompt library', 'book', D.prompts.length], ['templates', 'Templates', 'layers'], ['workflows', 'Workflows', 'flow'], ['workflow-builder', 'Pipeline builder', 'flow'], ['knowledge', 'Knowledge base', 'db'], ['vector-stores', 'Vector stores', 'cube'], ['tools', 'Tools', 'wrench'], ['integrations', 'Integrations', 'plug']]],
    ['Observe', [['monitor', 'Agent monitor', 'eye'], ['runs', 'Runs', 'list'], ['trace', 'Trace view', 'wave'], ['logs', 'Live logs', 'logs'], ['evals', 'Evaluations', 'check'], ['schedules', 'Schedules', 'clock'], ['alerts', 'Alerts', 'bell', D.totals.openAlerts], ['usage', 'Usage & cost', 'chart']]],
    ['Platform', [['models', 'Models', 'cpu'], ['providers', 'Providers', 'cloud'], ['keys', 'API keys & secrets', 'key'], ['billing', 'Billing', 'card'], ['team', 'Team', 'users'], ['roles', 'Roles & access', 'shield'], ['audit', 'Audit log', 'scroll'], ['notifications', 'Notifications', 'bell'], ['settings', 'Settings', 'cog'], ['profile', 'Profile', 'user'], ['ui-elements', 'UI elements', 'palette']]],
    ['Access', [['login', 'Sign in', 'lock'], ['signup', 'Create account', 'user'], ['forgot-password', 'Reset password', 'key'], ['onboarding', 'Onboarding', 'rocket'], ['404', '404 page', 'flag']]]
  ];
  var FLAT = []; NAV.forEach(function (g) { g[1].forEach(function (it) { FLAT.push({ id: it[0], label: it[1], icon: it[2], group: g[0] }); }); });

  function shell(page, html) {
    var navId = page === 'agent-detail' ? 'agents' : page; var cur = page === 'agent-detail' ? { label: 'Agent detail', group: 'Command' } : FLAT.filter(function (x) { return x.id === page; })[0] || { label: 'Overmind', group: 'Overmind' };
    var rail = '<aside class="rail" aria-label="Primary"><a class="brand" href="index.html">' + LOGO + '<span><b>OVERMIND</b><small>AGENT TERMINAL</small></span></a><nav class="nav">' +
      NAV.map(function (g) { return '<div class="nav-group">' + g[0] + '</div>' + g[1].map(function (it) { return '<a href="' + it[0] + '.html"' + (it[0] === navId ? ' aria-current="page"' : '') + '>' + icon(it[2]) + '<span>' + it[1] + '</span>' + (it[3] != null ? '<span class="count">' + it[3] + '</span>' : '') + '</a>'; }).join(''); }).join('') +
      '</nav><div class="rail-foot"><div class="row" style="gap:8px"><span class="dot"></span>' + D.totals.running + ' of ' + D.totals.agents + ' agents live</div><div style="margin-top:6px">v1.0.0 · MIT</div></div></aside>';
    var top = '<header class="topbar"><a class="m-brand" href="index.html">' + LOGO + '<span>OVERMIND</span></a><div class="crumbs">overmind / ' + esc(cur.group.toLowerCase()) + ' / <b>' + esc(cur.label) + '</b></div><div class="spacer"></div>' +
      '<button class="search-btn" data-palette aria-label="Open command palette">' + icon('search') + '<span class="lbl">Search or run a command…</span><kbd>Ctrl K</kbd></button>' +
      '<span class="status-pill hide-sm"><span class="dot"></span><span data-kpi="running">' + D.totals.running + '</span>&nbsp;running</span><span class="status-pill hide-sm mono" id="clock">14:00 SAST</span>' +
      '<button class="icon-btn" data-theme-toggle aria-label="Toggle theme">' + icon('sun') + '</button><a class="icon-btn" href="notifications.html" aria-label="Notifications">' + icon('bell') + '<span class="badge-dot"></span></a><a href="profile.html" class="avatar" aria-label="Profile">MD</a></header>';
    var dockItems = [['index', 'Home', 'grid'], ['terminal', 'Terminal', 'term'], ['agents', 'Agents', 'bot'], ['runs', 'Runs', 'list']];
    var dock = '<nav class="dock" aria-label="Quick navigation">' + dockItems.map(function (d) { return '<a href="' + d[0] + '.html"' + (d[0] === page ? ' aria-current="page"' : '') + '>' + icon(d[2]) + d[1] + '</a>'; }).join('') + '<button type="button" data-more aria-label="More pages">' + icon('menu') + 'More</button></nav>';
    document.body.innerHTML = '<div class="app">' + rail + '<div class="main">' + top + '<main class="content" id="view">' + html + '</main></div></div>' + dock;
  }
  function openMore(page) {
    closeOverlays();
    var s = document.createElement('div'); s.setAttribute('data-overlay', '');
    s.innerHTML = '<div class="scrim" data-close style="padding:0"></div><div class="sheet" role="dialog" aria-label="All pages"><div class="grab"></div>' +
      NAV.map(function (g) { return '<div class="nav-group" style="padding-left:2px">' + g[0] + '</div><div class="sgrid">' + g[1].map(function (it) { return '<a href="' + it[0] + '.html"' + (it[0] === page ? ' aria-current="page"' : '') + '>' + icon(it[2]) + it[1] + '</a>'; }).join('') + '</div>'; }).join('') + '</div>';
    document.body.appendChild(s);
  }
  function openPalette() {
    closeOverlays();
    var acts = [['Run prompt in terminal', 'terminal.html'], ['Create a new agent', 'create-agent.html'], ['Open prompt playground', 'playground.html'], ['View latest trace', 'trace.html'], ['Toggle light / dark theme', '#theme']];
    var s = document.createElement('div'); s.className = 'scrim'; s.setAttribute('data-overlay', '');
    s.innerHTML = '<div class="modal palette" role="dialog" aria-label="Command palette"><input placeholder="Type a page, agent or action…" aria-label="Search"><div class="res"></div></div>';
    document.body.appendChild(s);
    var inp = $('input', s), res = $('.res', s), sel = 0;
    function draw() {
      var q = inp.value.trim().toLowerCase(), items = [];
      acts.forEach(function (a) { if (!q || a[0].toLowerCase().indexOf(q) >= 0) items.push({ g: 'Actions', l: a[0], h: a[1], i: 'spark' }); });
      FLAT.forEach(function (p) { if (!q || p.label.toLowerCase().indexOf(q) >= 0) items.push({ g: 'Pages', l: p.label, h: p.id + '.html', i: p.icon, k: p.group }); });
      D.agents.forEach(function (a) { if (q && (a.name + ' ' + a.id).toLowerCase().indexOf(q) >= 0) items.push({ g: 'Agents', l: a.name, h: 'agent-detail.html?id=' + a.id, i: 'bot', k: a.id }); });
      if (sel >= items.length) sel = 0; var g = '';
      res.innerHTML = items.length ? items.slice(0, 40).map(function (it, i) { var gh = it.g !== g ? '<div class="grp">' + it.g + '</div>' : ''; g = it.g; return gh + '<a href="' + it.h + '"' + (i === sel ? ' aria-selected="true"' : '') + (it.h === '#theme' ? ' data-theme-toggle' : '') + '>' + icon(it.i) + esc(it.l) + '<small>' + esc(it.k || '') + '</small></a>'; }).join('') : empty('No matches', 'Try “agents”, “logs” or an agent name.');
    }
    inp.addEventListener('input', function () { sel = 0; draw(); });
    inp.addEventListener('keydown', function (e) {
      var links = $$('a', res); if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, links.length - 1); draw(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
      if (e.key === 'Enter' && links[sel]) { links[sel].click(); }
    });
    draw(); inp.focus();
  }

  /* ---- theme ---- */
  function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('om-theme', t); } catch (e) {} }
  var saved = null; try { saved = localStorage.getItem('om-theme'); } catch (e) {}
  applyTheme(saved || 'dark');

  /* ---- global events ---- */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') closeOverlays();
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('a,button,[role=switch],.toggle'); if (!t) return;
    if (t.hasAttribute('data-theme-toggle')) { e.preventDefault(); applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); closeOverlays(); toast('Theme: ' + document.documentElement.getAttribute('data-theme')); return; }
    if (t.hasAttribute('data-palette')) { openPalette(); return; }
    if (t.hasAttribute('data-more')) { openMore(document.body.getAttribute('data-page')); return; }
    if (t.classList.contains('toggle')) { var on = t.getAttribute('aria-checked') !== 'true'; t.setAttribute('aria-checked', on); toast((t.getAttribute('aria-label') || 'Setting') + (on ? ' enabled' : ' disabled')); return; }
    if (t.hasAttribute('data-close')) { closeOverlays(); }
    if (t.hasAttribute('data-modal')) { var m = t.getAttribute('data-modal'); modal(m, (MODALS[m] || function () { return '<p>' + esc(m) + ' — this is a demo dialog. Wire it to your backend.</p>'; })()); return; }
    if (t.hasAttribute('data-toast')) { toast(t.getAttribute('data-toast')); return; }
    if (t.hasAttribute('data-nav')) { nav(t.getAttribute('data-nav')); return; }
    if (t.tagName === 'A' && t.getAttribute('href') === '#') { e.preventDefault(); toast(t.textContent.trim() + ' — demo link'); return; }
    if (t.tagName === 'BUTTON' && !t.hasAttribute('data-handled') && !t.closest('[data-own]') && !t.hasAttribute('data-close') && t.type !== 'submit') {
      setTimeout(function () { if (!e.__handled) toast((t.getAttribute('aria-label') || t.textContent.trim() || 'Action') + ' — demo action'); }, 0);
    }
  });
  document.addEventListener('submit', function (e) { var f = e.target; e.preventDefault(); if (f.dataset.go) { toast(f.dataset.msg || 'Done'); setTimeout(function () { nav(f.dataset.go); }, 500); } else toast(f.dataset.msg || 'Saved'); });

  var MODALS = {
    'Invite teammate': function () { return '<form class="row" style="flex-direction:column;align-items:stretch;gap:12px" data-msg="Invite sent"><label class="f">Email<input class="input" type="email" placeholder="name@company.com"></label><label class="f">Role<select class="input"><option>Engineer</option><option>Prompt engineer</option><option>Analyst</option><option>Viewer</option></select></label></form>'; },
    'New API key': function () { return '<label class="f">Name<input class="input" placeholder="e.g. Helios staging"></label><p>The full key is shown once. Store it in your secrets manager.</p>'; },
    'New secret': function () { return '<label class="f">Key<input class="input mono" placeholder="SLACK_SIGNING_SECRET"></label><label class="f" style="margin-top:10px">Value<input class="input mono" type="password" value="••••••••••••"></label>'; },
    'Delete agent': function () { return '<p>This stops the agent, revokes its keys and archives its runs. Type the agent name to confirm.</p><input class="input" placeholder="Agent name">'; }
  };

  window.UI = { $: $, $$: $$, esc: esc, icon: icon, LOGO: LOGO, F: F, badge: badge, kpi: kpi, panel: panel, table: table, empty: empty, head: head, btn: btn,
    go: go, trackedCount: function () { return tracked.length + (D.Live && D.Live.isRunning() ? 1 : 0); }, lineChart: lineChart, barChart: barChart, donut: donut, toast: toast, modal: modal, closeOverlays: closeOverlays, nav: nav, shell: shell, NAV: NAV, FLAT: FLAT };

  /* ---- page lifecycle: track listeners/intervals added by a page's init so a swap can tear them down ---- */
  var tracked = [];
  function runInit(R) {
    var dAdd = document.addEventListener, wAdd = window.addEventListener, sI = window.setInterval;
    document.addEventListener = function (t, f, o) { tracked.push([document, t, f, o]); return dAdd.call(document, t, f, o); };
    window.addEventListener = function (t, f, o) { tracked.push([window, t, f, o]); return wAdd.call(window, t, f, o); };
    window.setInterval = function (f, ms) { var id = sI.call(window, f, ms); tracked.push(['interval', id]); return id; };
    try { if (R.init) R.init(); } finally { document.addEventListener = dAdd; window.addEventListener = wAdd; window.setInterval = sI; }
  }
  function teardown() {
    if (D.Live) D.Live.stop();
    tracked.forEach(function (t) { if (t[0] === 'interval') clearInterval(t[1]); else t[0].removeEventListener(t[1], t[2], t[3]); });
    tracked = [];
  }
  function markChrome(page) {
    var navId = page === 'agent-detail' ? 'agents' : page;
    var cur = page === 'agent-detail' ? { label: 'Agent detail', group: 'Command' } : FLAT.filter(function (x) { return x.id === page; })[0] || { label: 'Overmind', group: 'Overmind' };
    $$('.rail .nav a, .dock a').forEach(function (a) { var id = (a.getAttribute('href') || '').replace('.html', ''); if (id === navId) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var c = $('.crumbs'); if (c) c.innerHTML = 'overmind / ' + esc(cur.group.toLowerCase()) + ' / <b>' + esc(cur.label) + '</b>';
    var act = $('.rail .nav a[aria-current]'), rail = $('.rail');
    if (act && rail) { var ar = act.getBoundingClientRect(), rr = rail.getBoundingClientRect(); if (ar.bottom < rr.top || ar.top > rr.bottom) act.scrollIntoView({ block: 'nearest' }); }
  }
  function mount(page, first) {
    var R = window.PAGES && window.PAGES[page]; if (!R) return false;
    var out = R.render();
    if (first) { if (R.bare) document.body.innerHTML = out; else shell(page, out); }
    else { var v = $('#view'); v.innerHTML = out; v.classList.remove('view-in'); void v.offsetWidth; v.classList.add('view-in'); markChrome(page); }
    try { applyTheme(localStorage.getItem('om-theme') || document.documentElement.getAttribute('data-theme') || 'dark'); } catch (e) {}
    runInit(R);
    var c = $('#clock'); if (c) c.textContent = F.time(D.TODAY) + ' SAST';
    return true;
  }
  /* ---- in-app navigation: fetch the target page, swap only #view, keep the rail as is ---- */
  var navSeq = 0;
  function loaderHTML(label) {
    return '<div class="nav-loader" role="status" aria-live="polite"><div class="term" style="min-height:0"><div class="term-body" style="min-height:0;max-height:none"><div class="ln"><span class="p">deedz@overmind:~$</span> <span class="c" id="ldTxt"></span><span class="caret"></span></div><div class="ln o" id="ldSub">resolving route…</div><div class="progress" style="margin-top:10px;background:#1f2a38"><i id="ldBar" style="width:8%;transition:width .25s"></i></div></div></div></div>';
  }
  function go(href, push) {
    var url; try { url = new URL(href, location.href); } catch (e) { location.href = href; return; }
    var file = url.pathname.split('/').pop() || 'index.html', target = file.replace('.html', '');
    var curR = window.PAGES[document.body.getAttribute('data-page')], tR = window.PAGES[target];
    if (location.protocol === 'file:' || !$('#view') || !tR || tR.bare || !curR || curR.bare || url.origin !== location.origin) { location.href = url.href; return; }
    var seq = ++navSeq, label = (FLAT.filter(function (x) { return x.id === target; })[0] || { label: target }).label;
    closeOverlays(); teardown();
    var v = $('#view'); v.innerHTML = loaderHTML(label); markChrome(target);
    var cmd = 'loading ' + target + '…', i = 0, txt = $('#ldTxt');
    (function type() { if (seq !== navSeq || !txt.isConnected) return; txt.textContent = cmd.slice(0, ++i); if (i < cmd.length) setTimeout(type, 14); })();
    var bar = $('#ldBar'); setTimeout(function () { if (bar.isConnected) bar.style.width = '55%'; }, 30);
    var t0 = Date.now();
    fetch(url.href, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (html) {
      if (seq !== navSeq) return;
      var doc = new DOMParser().parseFromString(html, 'text/html'), pg = doc.body.getAttribute('data-page');
      if (!pg || !window.PAGES[pg] || window.PAGES[pg].bare) { location.href = url.href; return; }
      if (bar.isConnected) { bar.style.width = '100%'; $('#ldSub').textContent = 'route ' + file + ' · 200 OK'; }
      setTimeout(function () {
        if (seq !== navSeq) return;
        if (push) history.pushState({ page: pg }, '', url.href);
        document.title = doc.title; document.body.setAttribute('data-page', pg);
        window.scrollTo(0, 0); mount(pg, false);
      }, Math.max(0, 260 - (Date.now() - t0)));
    }).catch(function () { location.href = url.href; });
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download') || a.hasAttribute('data-theme-toggle')) return;
    var h = a.getAttribute('href'); if (!h || h[0] === '#' || /^(mailto:|tel:|https?:)/.test(h) || !/\.html(\?|#|$)/.test(h)) return;
    if (window.__OM_NONAV) { e.preventDefault(); window.__OM_LASTNAV = h; return; }
    if (location.protocol === 'file:') return; // plain navigation fallback
    e.preventDefault(); go(h, true);
  });
  window.addEventListener('popstate', function () { go(location.href, false); });

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    try { history.replaceState({ page: page }, '', location.href); } catch (e) {}
    mount(page, true);
  });
})();
