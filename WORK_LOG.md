# Work Log

## 2026-02-06
- Summary: Implemented multiple UX and functionality improvements to the before/after generator.
- Details:
  - Added drag-and-drop image uploads and click-to-browse on upload panels.
  - Added vertical/horizontal split toggle and fixed horizontal overlay rendering using clip-path.
  - Added label editor to customize BEFORE/AFTER text and sync with static export.
  - Added alignment + crop controls (X/Y offset, zoom) applied to previews, slider, and export.
- Files changed:
  - index.html
- Notes / Next steps:
  - Consider adding mouse-drag alignment and finer control steps.

---

## 2026-02-06 (React/Vite Migration + Mobile Fix + Pages Deploy)
- Summary: Migrated the app from single-file HTML/JS to React + Vite, fixed mobile splitter behavior, and restored GitHub Pages deployment.
- Details:
  - Fixed double file-picker prompt caused by click bubbling in upload drop zones.
  - Migrated project architecture to React 18 + Vite 5 with componentized app logic in `src/`.
  - Ported feature parity: before/after uploads, drag-and-drop, label editor, alignment controls, interactive slider, PNG export, and clear/reset flows.
  - Fixed mobile slider interaction by replacing state-based dragging with pointer capture (`setPointerCapture` / `releasePointerCapture`) and synchronous drag refs.
  - Added GitHub Pages workflow to build and deploy `dist/` via GitHub Actions.
  - Configured Vite `base` dynamically for project-site paths (`/<repo>/`) in Actions.
  - Updated docs and ignore rules for the new build output.
- Files changed:
  - .gitignore
  - .github/workflows/deploy-pages.yml
  - README.md
  - index.html
  - package.json
  - package-lock.json
  - src/App.jsx
  - src/main.jsx
  - src/styles.css
  - vite.config.js
- Notes / Next steps:
  - Migrate Tailwind from CDN to local PostCSS/Tailwind setup for production-safe styling.
  - Add Playwright smoke tests for upload, splitter drag (desktop/mobile), and export flow.
  - Optionally add save/load project state (JSON + localStorage autosave).

---

## 2026-02-06 (Splitter First Render Reliability)
- Summary: Fixed a render-timing bug where the splitter preview sometimes required pressing "Generate Comparison" twice to appear correctly.
- Details:
  - Identified race condition: dynamic height calculation was executed before the slider container had a stable post-render width.
  - Moved initial dynamic sizing out of the generate click handler and into a post-render effect.
  - Added a double `requestAnimationFrame` scheduling pattern plus short retry fallback to ensure the container is measurable.
  - Added guards to avoid splitter calculations when container dimensions are zero.
  - Preserved existing desktop and mobile pointer interaction behavior.
- Files changed:
  - src/App.jsx
- Notes / Next steps:
  - Add an end-to-end regression test to verify splitter preview initializes correctly on first generate action.

---

## Template
- Date: YYYY-MM-DD
- Summary:
- Details:
- Files changed:
- Notes / Next steps:
