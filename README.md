# Seattle Parking Finder

A mobile-first PWA for finding and navigating to parking in the Seattle area.

## Features

- **Interactive map** — OpenStreetMap with real-time parking markers and price bubbles
- **AI recommendation** — GPT-4o-mini picks the best spot based on distance and cost
- **Search** — Nominatim geocoding with recent search history
- **Saved spots** — Star any parking lot to save it for later
- **My Receipts** — Track parking sessions with live countdown timer
- **Google sign-in** — Firebase Auth; receipts and search history sync across devices via Firestore
- **Offline-ready** — Installable PWA with service worker caching

## Tech Stack

- React + Vite
- react-leaflet / Leaflet / OpenStreetMap
- OpenAI GPT-4o-mini
- Firebase Auth + Firestore
- Vercel (deployment)
- vite-plugin-pwa + Workbox

## Data

Parking data is sourced from the City of Seattle open data portal and OpenStreetMap, merged via `merge_parking.py`.

## Getting Started

```bash
npm install
npm run dev
```

Requires a `.env` file with:

```
VITE_OPENAI_API_KEY=...
VITE_FIREBASE_API_KEY=...
```
