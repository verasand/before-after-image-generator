# Before & After Image Generator

Create clean before/after comparisons from two images. The app lets you preview a draggable split view, fine‑tune alignment, and export a static side‑by‑side image for sharing.

## Highlights
- Interactive before/after slider with vertical or horizontal split
- Live label editor (BEFORE / AFTER)
- Alignment controls (X/Y offset + zoom) per image
- One‑click download of a static side‑by‑side PNG
- Mobile‑friendly touch controls

## Quick Start
Open `index.html` in any modern browser and upload two images.

## Local Dev With Live Reload
If you want mobile testing over Wi‑Fi and auto‑reload on save:

```powershell
npm install
npm run dev
```

Then open the site on your phone:
```
http://<YOUR_LOCAL_IP>:8000/index.html
```

## How It Works
Everything lives in a single file (`index.html`):
- HTML: structure
- Tailwind CSS (CDN): styling
- JavaScript: slider logic, alignment, and PNG export

## Project Structure
```
before-after-image-generator/
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── examples/
    ├── input/
    └── output/
```

## Examples
Input:
- `examples/input/before.jpg`
- `examples/input/after.jpg`

Output:
- `examples/output/output.png`

## Notes
- The styling uses Tailwind via CDN, so an internet connection is required unless you bundle CSS locally.
- For best results, use images with similar aspect ratios.
