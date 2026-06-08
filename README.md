# 🛸 Sabir UFO — Sighting & Research Platform

A cross-platform UFO sighting reporting & research platform built for the investigative
researcher **Sabir**. Public users sign in with Google, report sightings (with media + the
full **Hynek/Vallée scale**), watch his YouTube interviews, and buy his eBook via WhatsApp.
An admin reviews every incoming report.

- **Web:** Vanilla ES Modules + Vite — cosmic dark theme with animated starfield. Deployed on **Vercel**.
- **Mobile:** Flutter, sharing the same Firebase backend.
- **Backend:** Firebase Auth (Google) + Cloud Firestore — sits inside the free **Spark** plan.
- **Media:** Cloudinary unsigned uploads by default (free); optional Firebase Storage path.

---

## 1. Quick start (web, demo mode)

You can see the full UI working in **30 seconds** with mock data — no Firebase needed.

```bash
cd web
npm install
npm run dev
```

Open the printed URL (default <http://localhost:5173>). Demo mode is on by default —
sign-in, reports, and admin view all work against in-memory mock data.

---

## 2. Firebase setup (do this once)

1. Create a project at <https://console.firebase.google.com>.
2. Enable **Authentication → Sign-in method → Google**.
3. Enable **Cloud Firestore** (start in production mode — we ship strict rules).
4. Register a **Web App** in Project Settings → "Your apps" → `</>` and copy the config.
5. After you deploy to Vercel, add the Vercel domain (and any custom domain) under
   **Authentication → Settings → Authorized domains**.
6. Sign up at <https://cloudinary.com> (free tier) and create an **unsigned upload preset**
   (Settings → Upload → Add → Mode: **Unsigned**).

## 3. Configure locally

Copy `.env.example` to `web/.env` and fill in:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_EMAIL=...              # your Google email — auto-becomes admin
VITE_ADMIN_WHATSAPP=...           # intl format, digits only (e.g. 919876543210)
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=sabir_ufo_unsigned
VITE_DEMO_MODE=false
```

## 4. Deploy Firestore rules & indexes

```bash
npm install -g firebase-tools
firebase login
cd firebase
firebase use --add        # pick your sabir-ufo project
firebase deploy --only firestore:rules,firestore:indexes
```

## 5. Seed the eBook + interviews

Edit `web/scripts/seed.js` with your YouTube IDs and eBook details, then:

```bash
cd web
npm install firebase-admin                  # one-time
# place service-account.json in web/scripts/ (Firebase Console → Service accounts → Generate key)
npm run seed
```

## 6. Deploy the web app to Vercel

The web app ships with [web/vercel.json](web/vercel.json) (SPA rewrites + asset caching).

1. Push the repo to GitHub.
2. Go to <https://vercel.com/new>, **Import** the `Sabir-UFO` repo.
3. In the **Configure Project** screen, expand **Root Directory** and set it to **`web`**.
   Vercel will then auto-detect Vite and the build command will be `npm run build`.
4. Expand **Environment Variables**, paste each `VITE_*` key from your `.env`.
5. Click **Deploy**.
6. Once you have your Vercel URL, **go back to Firebase → Authentication → Settings →
   Authorized domains** and add the Vercel domain (and any custom domain). Without this,
   Google Sign-In will silently fail.

---

## 7. Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutterfire configure        # generates firebase_options.dart for all platforms
flutter run
```

Fill in `mobile/lib/config.dart` with your admin email, WhatsApp number, and Cloudinary
preset. See [mobile/README.md](mobile/README.md) for full details, including SHA-1
fingerprints required for Google Sign-In on Android.

---

## 8. Free-tier notes

- **Firestore Spark**: 50K reads / 20K writes / 1 GiB stored per day.
- **Cloud Storage on Spark**: new projects after Oct 2024 require Blaze. We default media to
  **Cloudinary** so uploads stay free. Flip `VITE_MEDIA_PROVIDER=firebase` in `.env` if your
  project supports it.
- **Cloudinary free**: 25 GB storage + 25 GB monthly bandwidth.
- **Map tiles**: free OpenStreetMap.
- **Vercel hobby**: free, includes HTTPS + global CDN + preview deploys per PR.

---

## 9. Project layout

```
/web        Vite + vanilla JS app (auth, profile, dashboard, report, map,
            interviews, ebook, admin) — cosmic dark theme.
/mobile     Flutter app mirroring the same features & Firebase backend.
/firebase   firestore.rules, firestore.indexes.json, firebase.json
/docs       Architecture + security model.
/web/vercel.json Vercel SPA rewrites + asset caching.
.env.example Template for all required keys.
```

See [docs/architecture.md](docs/architecture.md) for the data model + security model.
