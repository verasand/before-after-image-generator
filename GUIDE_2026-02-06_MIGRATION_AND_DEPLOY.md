# Technical Guide: 2026-02-06 Migration, Debugging, and Deployment

## 1) Executive Summary
This session completed three major outcomes:
- Fixed the upload UX bug where file selection was requested twice.
- Migrated the app from a single static `index.html` implementation to a React + Vite architecture.
- Repaired GitHub Pages deployment so the production URL serves built assets from `dist/`.

Current state:
- Main branch runs React/Vite app successfully.
- Mobile/desktop splitter interaction works with pointer events.
- GitHub Pages deploy is automated through GitHub Actions.

## 2) Initial Problems Detected
### A. Double file-picker on upload
Symptom:
- User selected an image once, then file explorer opened again automatically.

Root cause:
- The file input lived inside a clickable drop-zone.
- Input click opened native picker, then event bubbled to parent click handler that called `input.click()` again.

### B. Mobile splitter instability
Symptom:
- Vertical/horizontal slider behaved correctly on desktop but not on mobile touch.

Root cause:
- Drag lifecycle depended on React state (`isDragging`) which updates asynchronously.
- Touch `pointermove` events could arrive before state was updated.
- Pointer tracking was lost without pointer capture.

### C. GitHub Pages blank app with `src/main.jsx 404`
Symptom:
- Production site loaded dev `index.html` and attempted to fetch `/src/main.jsx`.

Root cause:
- Pages was not consistently serving Vite build output (`dist/`).
- Vite base path for project-site (`/<repo>/`) needed to be explicit in CI.
- Pages configuration and workflow mode needed alignment on GitHub Actions deployment.

## 3) Architecture Migration (HTML -> React + Vite)
### What changed
- Replaced monolithic script-driven DOM updates with React state and component rendering.
- Introduced Vite build pipeline and React entrypoint.

Main files:
- `index.html` (Vite entry shell)
- `src/main.jsx` (React bootstrap)
- `src/App.jsx` (application logic/UI)
- `src/styles.css` (custom styles + slider/drop-zone styles)
- `vite.config.js` (Vite config, including Pages base handling)
- `package.json` / `package-lock.json` (React/Vite dependencies and scripts)

### Preserved features
- Upload before/after images.
- Drag & drop uploads with click-to-browse.
- Interactive vertical/horizontal split preview.
- Label editor (BEFORE/AFTER).
- Alignment/crop controls (X/Y/Zoom per image).
- Static PNG side-by-side export.
- Clear/reset behavior.

## 4) Bug Fixes Implemented
### A. Upload double-picker fix
Implementation:
- In drop-zone click handler, ignore events originating from the input itself.
- Stop propagation on input click.

Effect:
- Picker opens once from native input click.
- Drop-zone click-to-browse remains functional.

### B. Mobile splitter drag fix
Implementation:
- Replaced `isDragging` state control with `isDraggingRef` for synchronous drag gating.
- Added `setPointerCapture(event.pointerId)` on `pointerdown`.
- Added `releasePointerCapture` on `pointerup` and `pointercancel`.

Effect:
- Touch drag is stable and continuous in both orientations.
- Pointer tracking no longer drops when finger moves quickly or leaves bounds.

## 5) GitHub Pages Deployment Fix
### Changes made
- Added workflow: `.github/workflows/deploy-pages.yml`.
  - `npm ci`
  - `npm run build`
  - Upload `./dist` artifact
  - Deploy with `actions/deploy-pages`
- Updated `vite.config.js`:
  - Detect GitHub Actions environment.
  - Set `base` to `/${repoName}/` for project pages.
  - Use `/` locally.

### Why this works
- Vite output uses asset URLs compatible with `https://<user>.github.io/<repo>/`.
- GitHub Pages serves compiled build artifacts, not source JSX.

## 6) Validation Performed
- `npm install`
- `npm run build` (multiple times across fixes)
- Deployment workflow execution verified as successful.
- Production URL checked for expected app rendering behavior.

## 7) Final Repository/Runtime State
- Branch `main` contains:
  - React/Vite migration
  - Upload double-picker fix
  - Mobile pointer drag fix
  - GitHub Pages Actions deployment setup
- Production URL:
  - `https://verasand.github.io/before-after-image-generator/`

## 8) Known Non-Blocking Warning
- Tailwind CDN warning:
  - `cdn.tailwindcss.com should not be used in production`
- Status:
  - Does not break the app.
  - Recommended next step is local Tailwind integration (PostCSS/Tailwind package) for production best practice.

## 9) Recommended Next Engineering Steps
1. Replace Tailwind CDN with local Tailwind + PostCSS setup.
2. Add end-to-end smoke tests (Playwright):
   - Upload before/after
   - Splitter drag desktop + mobile emulation
   - PNG export availability
3. Add project persistence:
   - Export/import JSON state
   - localStorage autosave

## 10) Quick Operational Checklist
For local dev:
```powershell
npm install
npm run dev
```

For production build:
```powershell
npm run build
npm run preview
```

For Pages:
- Ensure `Settings > Pages > Source = GitHub Actions`.
- Push to `main` and verify workflow success in `Actions`.
