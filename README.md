# DebtPilot PWA

DebtPilot is a mobile-first, offline-first VND debt tracker for Vietnam built with Vite, React, TypeScript, Tailwind CSS, Dexie, IndexedDB, and `vite-plugin-pwa`.

## Requirements

- Ubuntu Linux
- Node.js 18 or newer
- npm

If Ubuntu has Node but not npm, install npm with:

```bash
sudo apt update
sudo apt install npm
```

## Setup

```bash
cd debtpilot-pwa
npm install
npm run dev
```

The dev server is configured with `--host 0.0.0.0` so you can test from another device on the same Wi-Fi network.

## Build And Preview

```bash
npm run build
npm run preview
```

The production build emits a service worker and `manifest.json`. Use `npm run preview` to test the installable PWA build locally.

## Deploy With GitHub Pages

This repo includes `.github/workflows/deploy.yml`. After pushing to GitHub:

1. Open the repository on GitHub.
2. Go to Settings > Pages.
3. Set Source to GitHub Actions.
4. Push to the `main` branch.

The public URL will look like:

```text
https://YOUR_USERNAME.github.io/debtpilot-pwa/
```

## iPhone Safari Add To Home Screen

1. Run `npm run preview`.
2. Open the preview URL in Safari on your iPhone.
3. Tap Share.
4. Tap Add to Home Screen.
5. Launch DebtPilot from the Home Screen icon.

For phone testing from Ubuntu, find your machine IP address with:

```bash
hostname -I
```

Then open the preview URL from your iPhone, for example:

```text
http://192.168.1.20:4173
```

## Data

- No backend.
- No login.
- No paid APIs.
- Debt items and payment history are stored locally in IndexedDB using VND.
- The app shell is cached by the service worker after a production build.
- Settings includes a demo data seed button and a clear data button.
- Existing legacy card records are adapted into debt items during IndexedDB migration when possible.

## Project Structure

```text
src/
  app/
  components/
  db/
  hooks/
  lib/
  pages/
  types/
```

## Finance Rules

- All money values are VND and formatted with `vi-VN`.
- Dashboard totals combine active debt items and payment history.
- Due tracking supports monthly due days and one-off due dates.
- Projection simulates active debts together with no interest, simple interest, or compound interest.
- Projection applies monthly minimum/fixed payments and optional extra daily payments.
- Simulations stop after 50 years and show a warning when payments are too low.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run icons
```
