# Contributing to Overmind Terminal

Thanks for helping. This kit stays **dependency-free**: plain HTML, CSS and JavaScript with no build step.

## Getting set up
1. Fork the repo, then clone your fork.
2. Run `npm run serve` (or `python3 -m http.server 8080`) and open http://localhost:8080.

## Ground rules
- **Data:** every number comes from `assets/js/data.js`. Never hard-code a count or total that the data can derive.
- **Accessibility:** text contrast must be 4.5:1 or better in **both** themes. Interactive elements need a visible focus state and a label.
- **Responsive:** check 390, 768 and 1280 px. The page must not scroll sideways, and wide tables must scroll inside `.table-wrap`.
- **Interactivity:** every button must do something (navigate, open a modal or show a toast). Lists need empty states.
- **Charts:** they need axes, labels and a legend, and their values must match the data.
- **Style:** 2-space indentation, ES5-compatible JavaScript, no frameworks.

## Pull requests
- Keep PRs focused and describe the change. Include before and after screenshots for UI changes.
- Add an entry under `Unreleased` in `CHANGELOG.md`.
- If you add a page, update `tools/make-pages.py`, `NAV` in `app.js` and the page list in `README.md`.

## Reporting bugs
Open an issue with your browser, viewport width, theme, steps to reproduce and a screenshot.
