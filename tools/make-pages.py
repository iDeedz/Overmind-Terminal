#!/usr/bin/env python3
"""Regenerates the thin HTML entry files. Optional: the HTML is committed, no build step is needed to run the kit."""
import os
PAGES = {
 'index':'Overview','terminal':'Terminal','agents':'Agent fleet','agent-detail':'Agent detail','create-agent':'Create agent',
 'playground':'Playground','compare':'Compare models','prompts':'Prompt library','templates':'Templates','workflows':'Workflows',
 'workflow-builder':'Pipeline builder','knowledge':'Knowledge base','vector-stores':'Vector stores','tools':'Tools','integrations':'Integrations',
 'monitor':'Agent monitor','runs':'Runs','trace':'Trace view','logs':'Live logs','evals':'Evaluations','schedules':'Schedules','alerts':'Alerts','usage':'Usage & cost',
 'models':'Models','providers':'Providers','keys':'API keys & secrets','billing':'Billing','team':'Team','roles':'Roles & access','audit':'Audit log',
 'notifications':'Notifications','settings':'Settings','profile':'Profile','ui-elements':'UI elements','login':'Sign in','signup':'Create account',
 'forgot-password':'Reset password','onboarding':'Onboarding','404':'Page not found'}
T = '''<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Overmind Terminal</title>
<meta name="description" content="Overmind Terminal: an open-source futuristic AI agent command terminal and dashboard UI kit.">
<link rel="icon" href="assets/img/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/overmind.css">
<script>try{{document.documentElement.setAttribute('data-theme',localStorage.getItem('om-theme')||'dark')}}catch(e){{}}</script>
</head>
<body data-page="{page}">
<noscript><p style="padding:24px">Overmind Terminal needs JavaScript enabled to render this demo.</p></noscript>
<script src="assets/js/data.js"></script>
<script src="assets/js/live.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/pages-core.js"></script>
<script src="assets/js/pages-ops.js"></script>
<script src="assets/js/pages-monitor.js"></script>
<script src="assets/js/pages-swarm.js"></script>
</body>
</html>
'''
root = os.path.join(os.path.dirname(__file__), '..')
for p, t in PAGES.items():
    open(os.path.join(root, p + '.html'), 'w').write(T.format(title=t, page=p))
print(len(PAGES), 'pages')
