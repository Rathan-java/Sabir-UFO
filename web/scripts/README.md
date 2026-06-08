# Seed script

`seed.js` writes the eBook config + interview list to Firestore so the app has real content when you turn off demo mode.

## One-time setup

1. Install firebase-admin in this folder:
   ```bash
   cd web
   npm install firebase-admin
   ```
2. Generate a service account key:
   Firebase Console → Project Settings → **Service accounts** → **Generate new private key**.
   Save it as `web/scripts/service-account.json`. **Do not commit it** — it's in `.gitignore`.
3. Edit the `EBOOK` and `INTERVIEWS` arrays at the top of `seed.js` with your real YouTube IDs and eBook details.
4. Run from the `web/` folder:
   ```bash
   npm run seed
   ```

You only need to re-run this when you change interviews or eBook content. Long-term, build an admin UI for it.
