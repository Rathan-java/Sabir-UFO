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

export const HYNEK_CLASSIFICATIONS = [
  'Nocturnal Lights',
  'Daylight Discs',
  'Radar–Visual',
  'Close Encounter of the First Kind (CE-1)',
  'Close Encounter of the Second Kind (CE-2)',
  'Close Encounter of the Third Kind (CE-3)',
  'Close Encounter of the Fourth Kind (CE-4 — abduction)',
  'Close Encounter of the Fifth Kind (CE-5 — direct communication)',
  'Other / Unknown',
];

export const OBJECT_SHAPES = [
  'Disc', 'Triangle', 'Sphere', 'Cigar', 'Cluster', 'Light', 'Other',
];

export const STATUSES = ['pending', 'reviewed', 'verified', 'rejected'];
