# My Health Journey — PWA

Offline-first personal health tracker.

## Included
- Home dashboard
- Weight journey: 82 kg -> 64 kg
- Blood pressure logging + high-reading safety message
- Fasting
- Walking
- Sleep
- Meal logging placeholder
- Medication section placeholder
- Weekly-style insights
- LocalStorage persistence
- PWA install manifest
- Service worker for offline use
- JSON data backup/export

## Important
The sample values are demo data. This is not a medical device and does not replace clinical care.

## Run locally
A PWA needs HTTPS or localhost for its service worker/install features.

Example:
`python3 -m http.server 8080`

Then open:
`http://localhost:8080`

For phone installation, publish the folder to an HTTPS static host such as GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

## Next build
1. Add a real database layer.
2. Add Android Health Connect.
3. Add scheduled medication notifications.
4. Add real fasting timer.
5. Add charts with historical data.
6. Add CSV/PDF export.
7. Add biometric/app-lock strategy where supported.
8. Add secure cloud sync only if desired.

## UI refresh
- Added more spacing between the daily metrics and checklist.
- Replaced navigation and common feature symbols with consistent outline SVG icons.
- Refined typography with DM Sans and system-font fallbacks.
- Updated service-worker cache version so browsers can fetch the new UI.
