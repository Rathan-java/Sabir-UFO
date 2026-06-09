// Central env / config loader for the Sabir UFO web app.
// All keys are pulled from Vite env vars (.env). Demo mode shortcuts every
// Firebase call to in-memory mocks so the app runs with zero secrets.

const env = import.meta.env;

export const config = {
  demoMode: (env.VITE_DEMO_MODE ?? 'true').toString().toLowerCase() !== 'false',

  firebase: {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  },

  adminEmail: (env.VITE_ADMIN_EMAIL || '').toLowerCase().trim(),
  adminWhatsapp: (env.VITE_ADMIN_WHATSAPP || '').replace(/\D/g, ''),

  media: {
    provider: env.VITE_MEDIA_PROVIDER || 'cloudinary',
    cloudinary: {
      cloudName: env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET,
    },
  },
};

// Sighting categories — plain-language labels for first-time reporters.
// The technical term stays as a prefix so researchers still recognize it,
// followed by a short description anyone can understand.
export const HYNEK_CLASSIFICATIONS = [
  'Nocturnal Lights (Glowing lights or ball-shaped UFO seen at night)',
  'Daylight Discs (Disc or saucer-shaped UFO seen in daylight)',
  'Radar-Visual (UFO seen with eyes AND picked up on radar)',
  'Close Encounter of the First Kind (Saw a UFO up close, no contact)',
  'Close Encounter of the Second Kind (UFO left physical traces — burn marks, ground impressions, electrical interference)',
  'Close Encounter of the Third Kind (Saw beings or creatures near the UFO)',
  'Close Encounter of the Fourth Kind (Felt taken aboard or abducted)',
  'Close Encounter of the Fifth Kind (Communicated directly with beings)',
  'Other / Not sure',
];

export const OBJECT_SHAPES = [
  'Disc (saucer-shaped)',
  'Triangle (triangular)',
  'Sphere (round / ball)',
  'Cigar (long, tube-shaped)',
  'Cluster (group of small UFOs together)',
  'Light (just a point or ball of light)',
  'Other',
];

export const STATUSES = ['pending', 'reviewed', 'verified', 'rejected'];
