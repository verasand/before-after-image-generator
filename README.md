# Before & After Image Generator

Create clean before/after comparisons from two images. The app includes a draggable split preview, per-image alignment controls, and PNG export.

## Highlights
- Before/after slider with vertical and horizontal split modes
- Label editor for `BEFORE` and `AFTER`
- Alignment controls per image (`x`, `y`, `zoom`)
- Static side-by-side PNG export
- Drag-and-drop plus click-to-browse upload
- Desktop and mobile-friendly interactions

## Stack
- React 18
- Vite 5
- Tailwind CSS via CDN (for utility classes)

## Quick Start
```powershell
npm install
npm run dev
```

Open:
```text
http://localhost:8000
```

For LAN/mobile testing:
```text
http://<YOUR_LOCAL_IP>:8000
```

## Build
```powershell
npm run build
npm run preview
```

## Project Structure
```text
before-after-image-generator/
|- index.html
|- src/
|  |- App.jsx
|  |- main.jsx
|  |- styles.css
|- vite.config.js
|- package.json
|- README.md
|- examples/
   |- input/
   |- output/
```

## Notes
- The UI depends on the Tailwind CDN script in `index.html`.
- For best visual results, use images with similar aspect ratios.
