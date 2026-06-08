// Seed Firestore with the eBook config + sample interviews.
// Run with:   node scripts/seed.js
// Requires service-account credentials at: scripts/service-account.json
// (Firebase Console → Project Settings → Service accounts → Generate new private key)

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(__dirname, 'service-account.json');

// -------- EDIT THESE --------
const EBOOK = {
  title: 'Signals From the Other Side',
  blurb:
    'A decade of field investigations, declassified records, and pilot testimony — distilled into a single volume on the modern UAP phenomenon.',
  price: '$19.99',
  coverImageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&q=70',
};

const INTERVIEWS = [
  { id: 'iv1', title: 'The Nimitz Encounter — A Pilot\'s Account', youtubeId: 'REPLACE_WITH_YT_ID_1', publishedAt: '2025-04-12', order: 1 },
  { id: 'iv2', title: 'Inside the Pentagon UAP Task Force',         youtubeId: 'REPLACE_WITH_YT_ID_2', publishedAt: '2025-03-01', order: 2 },
  { id: 'iv3', title: 'Skinwalker Ranch — What We Actually Saw',    youtubeId: 'REPLACE_WITH_YT_ID_3', publishedAt: '2025-02-15', order: 3 },
];
// ----------------------------

let app;
if (existsSync(KEY_PATH)) {
  const creds = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
  app = initializeApp({ credential: cert(creds) });
} else {
  console.log('[seed] No scripts/service-account.json found — trying applicationDefault().');
  app = initializeApp({ credential: applicationDefault() });
}

const db = getFirestore(app);

async function run() {
  console.log('[seed] Writing ebook/config…');
  await db.collection('ebook').doc('config').set(EBOOK, { merge: true });

  console.log(`[seed] Writing ${INTERVIEWS.length} interviews…`);
  for (const iv of INTERVIEWS) {
    const { id, ...rest } = iv;
    await db.collection('interviews').doc(id).set({
      ...rest,
      publishedAt: new Date(rest.publishedAt),
    }, { merge: true });
  }

  console.log('[seed] Done. Edit scripts/seed.js to replace placeholder YouTube IDs + eBook details, then re-run.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
