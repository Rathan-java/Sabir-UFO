# Sabir UFO — Flutter mobile app

Mirrors the web app's features (auth, profile, dashboard, report, my reports,
map, interviews, eBook, admin) against the same Firebase backend.

## First-time setup

1. **Flutter SDK** ≥ 3.3.0.
2. **Install Firebase CLI + FlutterFire CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   dart pub global activate flutterfire_cli
   ```
3. **From the `mobile/` folder**, wire Firebase into the app:
   ```bash
   flutterfire configure
   ```
   This **regenerates `lib/firebase_options.dart`** and writes platform configs
   (`android/app/google-services.json`, `ios/Runner/GoogleService-Info.plist`).
4. **Fill in `lib/config.dart`** with your `adminEmail`, `adminWhatsApp`, and
   Cloudinary `cloudName` + `uploadPreset`.
5. **Enable Google Sign-In** in Firebase Console → Authentication → Sign-in
   method. Add your SHA-1 fingerprint(s) for Android.
6. **Install pods (iOS)**:
   ```bash
   cd ios && pod install && cd ..
   ```
7. **Run**:
   ```bash
   flutter pub get
   flutter run
   ```

## Media uploads

`lib/services/media_service.dart` uploads to Cloudinary's free unsigned endpoint.
To swap to Firebase Storage (requires Blaze plan), replace the body of
`MediaService.upload` with the Firebase Storage SDK calls — the abstraction is
already there so nothing else in the app needs to change.

## Firestore rules

The Flutter app shares Firestore rules with the web app — deploy them from the
`/firebase` folder at the repo root:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
