# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-12
### Added
- First public release: 39 pages, including a live Agent monitor, covering the command terminal, agent fleet, agent detail, create-agent wizard, playground, model compare, prompts, templates, workflows, pipeline builder, knowledge base, vector stores, tools, integrations, runs, trace waterfall, live logs, evals, schedules, alerts, usage and cost, models, providers, keys and secrets, billing, team, roles, audit, notifications, settings, profile, UI elements, login, signup, password reset, onboarding and 404.
- A fake shell with tabs, history, autocomplete, slash commands and streamed output.
- Live Overview: activity feed, agent status strip, real-time tokens/min chart and an Agent swarm canvas, sharing one simulation engine with the Agent monitor. Book totals never change; live activity shows as a session delta.
- In-app navigation: fetches the target page and swaps only the main content, with a terminal-style loader, pushState history, a sidebar that keeps its scroll position, per-page timer and listener cleanup, and a `file://` fallback.
- A `Ctrl/⌘ + K` command palette, a dark/light theme toggle, toasts and modals.
- A single number book (`assets/js/data.js`) that drives every metric and chart.
