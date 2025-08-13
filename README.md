# Wanderlust Travel Map — Lite

Minimal, fast React + Vite + Leaflet map to track places you've **visited** or added to your **wishlist**.

## Features
- 🌍 Click the map to add a pin (name + status: visited / wishlist)
- 🧭 "Locate me" button to jump to your current position
- 🔎 Filter pins by status
- 💾 Auto-saves to `localStorage`
- ⬆️ Export / ⬇️ Import JSON
- 🗑️ Clear all
- ⚡ Vite + React + TypeScript, no backend

## Quick start
```bash
npm i
npm run dev
```

Then open the printed localhost URL.

## Notes
- Map tiles: OpenStreetMap (via `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- If markers don't show, ensure `leaflet/dist/leaflet.css` is loaded (it's imported in `App.tsx`).
- Data is stored in your browser under the key `wtm_pins_v1`.
