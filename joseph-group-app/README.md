# Joseph Group Safety Inspection Report

A mobile-first HSE inspection app: Login → Department Selection → Dashboard → 11 inspection modules
(Fire Hose Reel, Fire Extinguisher, Electrical Tools, Portable Tools, Ladder, Hand Tools,
HSE Inspection Report, Corrective Action Request, Incident Report, Incident Investigation
Report, Disciplinary Warning).

## 1. Run it locally

You need [Node.js](https://nodejs.org) installed (version 18 or later).

```bash
npm install
npm run dev
```

This opens the app at `http://localhost:5173`. Open it in your browser or on your
phone (same WiFi network, using your computer's local IP instead of `localhost`).

## 2. Important: read this about data storage

Every screen currently saves data through `window.storage`, a feature that only exists
inside Claude.ai's preview sandbox. To make the app work as a real, standalone website,
`src/lib/storageShim.js` replaces it with a version backed by the browser's own
`localStorage` — so the app works immediately, with no extra setup.

**The limitation:** `localStorage` is per-browser, per-device. If Sayed submits a report
on his phone, Sharan will **not** see it when she opens the app on her own phone — each
device keeps its own separate copy. This is fine for testing solo or on one shared
device, but for real day-to-day use by two people on two separate phones, you need a
shared backend.

### Upgrading to a shared backend (e.g. Firebase)

1. Create a free [Firebase](https://firebase.google.com) project and enable Firestore.
2. Replace the three function bodies in `src/lib/storageShim.js` (`get`, `set`, `delete`,
   `list`) with equivalent Firestore read/write calls, **keeping the same function
   signatures**. Nothing else in the app needs to change — every screen only ever calls
   `window.storage.get/set/delete/list`, so the swap is isolated to this one file.
3. Add your Firebase config (API key, project ID, etc.) to a new file, e.g.
   `src/lib/firebaseConfig.js`, and import it inside `storageShim.js`.

## 3. Deploy it online (so it works on real phones, anywhere)

The easiest free options, both with zero server setup:

**Vercel:**
```bash
npm install -g vercel
vercel
```
Follow the prompts — it builds and deploys automatically, giving you a live URL.

**Netlify:**
```bash
npm run build
```
Then drag the generated `dist/` folder into [Netlify Drop](https://app.netlify.com/drop).

Either way, once deployed, Sayed and Sharan can open the URL on their phones and use
**"Add to Home Screen"** (Safari/Chrome share menu) to make it behave like an installed
app — no app store needed.

## 4. Packaging as a real Android/iOS app (later, optional)

Once the PWA is solid and (ideally) running on a real shared backend:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

This wraps the built app in a native shell that can be submitted to Google Play / the
Apple App Store.

## Project structure

```
deploy-project/
├── package.json
├── vite.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx              ← entry point, loads the storage shim first
    ├── App.jsx                ← top-level navigation (Login → Department → Dashboard → module)
    ├── lib/
    │   └── storageShim.js     ← replaces window.storage for real deployment
    └── components/
        ├── LoginScreen.jsx
        ├── DepartmentSelection.jsx
        ├── Dashboard.jsx
        ├── FireHoseReelInspection.jsx
        ├── FireExtinguisherInspection.jsx
        ├── ElectricalToolsInspection.jsx
        ├── PortableToolsInspection.jsx
        ├── LadderInspection.jsx
        ├── HandToolsInspection.jsx
        ├── HSEInspectionReport.jsx
        ├── CorrectiveActionRequest.jsx
        ├── IncidentReport.jsx
        ├── IncidentInvestigationReport.jsx
        └── DisciplinaryWarning.jsx
```
