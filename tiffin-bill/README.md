# Tiffin Bill — Offline PWA

This is the browser/PWA version of Tiffin Bill. It is designed to be installed on the restaurant owner's iPhone and Android phone without creating a native iOS/Android application.

## iPhone

1. Serve this folder from an HTTPS web address.
2. Open that address in Safari.
3. Tap Share → Add to Home Screen.
4. Enable **Open as Web App** → Add.
5. Launch **Tiffin Bill** from the Home Screen.

Apple documents the Add to Home Screen + Open as Web App flow for iPhone. The site must be opened from a real web origin; a downloaded `file://`/`content://` HTML file cannot install a service worker/PWA reliably.

## Android

1. Serve this folder from HTTPS.
2. Open it in Chrome.
3. Use Chrome's install/add-to-home-screen option when offered.
4. Launch Tiffin Bill from the Home Screen/app launcher.

## Offline behavior

The service worker caches the complete app shell. Food images are embedded in `index.html`, so no image CDN is required. After the first successful online load/installation, the app can launch from its cached shell without internet.

Menu configuration and prices continue to use the app's local persistent storage. Browser/OS storage can still be cleared by the user or operating system.

## Important

Do **not** open `index.html` directly from Downloads and expect PWA installation. Service workers require a secure web origin (HTTPS; localhost is allowed for development).

## Files

- `index.html` — Tiffin Bill v41 UI and billing logic
- `manifest.json` — PWA metadata/install configuration
- `sw.js` — offline app-shell cache
- `icon-192.png`, `icon-512.png` — app icons
