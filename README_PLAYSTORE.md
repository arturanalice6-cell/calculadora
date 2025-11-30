FitSwap — Play Store Packaging Guide
===================================

This project has been prepared as a PWA and includes a service worker and manifest to be wrapped as an Android TWA or packaged with Capacitor.

Important files:
- public/manifest.json
- public/service-worker.js
- twa-manifest.json (Bubblewrap helper, replace host with your deployed site)

Steps to publish (recommended - TWA with Bubblewrap):
1) Deploy this web app to a secure HTTPS host (e.g., Vercel, Netlify). The app must be reachable at a public URL.
2) Update `twa-manifest.json` "host" field with your deployed URL (no trailing slash).
3) Install Bubblewrap (requires Java + Android SDK):
   - npm install -g @bubblewrap/cli
4) Generate TWA project:
   - bubblewrap init --manifest=twa-manifest.json
   - bubblewrap build
5) Open the generated Android project and build an AAB for Play Store.

Alternative (Capacitor):
1) npm install @capacitor/core @capacitor/cli
2) npx cap init
3) npx cap add android
4) npx cap copy android
5) Open Android project in Android Studio and build AAB/APK.

Local testing:
- npm install
- npm run build
- Serve the `dist` folder over HTTPS (or use Vercel to preview deployment)

Security note:
- Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as environment variables in production.
- Do NOT embed secret service_role keys on the client.

PRO_TIPS:
- Ensure icons are at recommended sizes: 192x192 and 512x512.
- Test offline behavior by running a local HTTPS server and turning off the network.
- For push notifications use Firebase Cloud Messaging + a server to send messages.
