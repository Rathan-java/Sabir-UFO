// In-memory mock store used when VITE_DEMO_MODE=true.
// Lets the full UI work without any Firebase keys, with seeded data.

import { config } from './config.js';

const KEY = 'sabir-ufo-demo-store-v1';

const SEED_USERS = {
  'demo-uid-explorer': {
    id: 'demo-uid-explorer',
    displayName: 'Demo Explorer',
    email: 'explorer@example.com',
    photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=DE&backgroundColor=7a5cff',
    role: 'user',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
};

const SEED_INTERVIEWS = [
  { id: 'iv1', title: 'The Nimitz Encounter — A Pilot\'s Account', youtubeId: 'dQw4w9WgXcQ', publishedAt: Date.now() - 86400000 * 14, order: 1 },
  { id: 'iv2', title: 'Inside the Pentagon UAP Task Force', youtubeId: 'L_LUpnjgPso', publishedAt: Date.now() - 86400000 * 30, order: 2 },
  { id: 'iv3', title: 'Skinwalker Ranch — What We Actually Saw', youtubeId: 'jNQXAC9IVRw', publishedAt: Date.now() - 86400000 * 60, order: 3 },
];

const SEED_EBOOK = {
  title: 'Signals From the Other Side',
  blurb:
    'A decade of field investigations, declassified records, and pilot testimony — distilled into a single volume on the modern UAP phenomenon. Includes maps, classifications, and the author\'s own first-hand encounters.',
  price: '$19.99',
  coverImageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=600&q=70&auto=format&fit=crop',
};

const SEED_SIGHTINGS = [
  {
    id: 's1',
    reporterUid: 'demo-uid-explorer',
    reporterName: 'Demo Explorer',
    reporterEmail: 'explorer@example.com',
    isPublic: true,
    classification: 'Nocturnal Lights',
    objectShape: 'Light',
    witnessCount: 2,
    sightedAt: Date.now() - 86400000 * 3,
    durationText: '~4 minutes',
    location: { lat: 34.0901, lng: -118.4065, place: 'Beverly Hills, CA' },
    description:
      'Three pulsing amber lights moved in a tight triangle, silent, against the wind. They held formation for ~3 minutes then accelerated north at impossible speed.',
    media: [
      { url: 'https://images.unsplash.com/photo-1532978879514-6c8b96218fa5?w=900&q=70', type: 'image' },
    ],
    status: 'pending',
    adminNotes: '',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 's2',
    reporterUid: 'demo-uid-explorer',
    reporterName: 'Demo Explorer',
    reporterEmail: 'explorer@example.com',
    isPublic: false,
    classification: 'Close Encounter of the First Kind (CE-1)',
    objectShape: 'Disc',
    witnessCount: 1,
    sightedAt: Date.now() - 86400000 * 14,
    durationText: '~90 seconds',
    location: { lat: 36.1699, lng: -115.1398, place: 'Las Vegas, NV' },
    description:
      'Metallic disc, ~30m diameter, hovered at low altitude over the strip. No sound, no visible propulsion. Departed instantly.',
    media: [],
    status: 'verified',
    adminNotes: 'Cross-referenced with two corroborating witness accounts.',
    createdAt: Date.now() - 86400000 * 14,
  },
  {
    id: 's3',
    reporterUid: 'demo-uid-explorer',
    reporterName: 'Demo Explorer',
    reporterEmail: 'explorer@example.com',
    isPublic: true,
    classification: 'Daylight Discs',
    objectShape: 'Sphere',
    witnessCount: 5,
    sightedAt: Date.now() - 86400000 * 28,
    durationText: '~12 minutes',
    location: { lat: 51.5074, lng: -0.1278, place: 'London, UK' },
    description: 'A bright reflective sphere drifted slowly across a clear sky, then split into two distinct objects before disappearing.',
    media: [],
    status: 'reviewed',
    adminNotes: '',
    createdAt: Date.now() - 86400000 * 28,
  },
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

const state = load() || {
  currentUser: null,
  users: { ...SEED_USERS },
  sightings: [...SEED_SIGHTINGS],
  interviews: [...SEED_INTERVIEWS],
  ebook: SEED_EBOOK,
};

// Re-seed if user wiped localStorage but kept old version
if (!state.users) state.users = { ...SEED_USERS };
if (!state.sightings) state.sightings = [...SEED_SIGHTINGS];
if (!state.interviews) state.interviews = [...SEED_INTERVIEWS];
if (!state.ebook) state.ebook = SEED_EBOOK;

const authListeners = new Set();

function emitAuth() {
  authListeners.forEach((cb) => cb(state.currentUser));
}

function persist() { save(state); }

function uid() {
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const mockStore = {
  // ---- auth ----
  demoSignIn() {
    // Simulate a Google sign-in. If admin email is configured and matches a seed,
    // promote them; otherwise default to the explorer demo user.
    const adminEmail = config.adminEmail;
    let user;
    if (adminEmail && adminEmail.length > 0) {
      const adminUid = 'demo-uid-admin';
      if (!state.users[adminUid]) {
        state.users[adminUid] = {
          id: adminUid,
          displayName: 'Demo Admin',
          email: adminEmail,
          photoURL: 'https://api.dicebear.com/7.x/initials/svg?seed=AD&backgroundColor=7be9ff',
          role: 'admin',
          createdAt: Date.now(),
        };
      }
      user = state.users[adminUid];
    } else {
      user = state.users['demo-uid-explorer'];
    }
    state.currentUser = {
      uid: user.id,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
    persist();
    emitAuth();
    return state.currentUser;
  },

  demoSignOut() {
    state.currentUser = null;
    persist();
    emitAuth();
  },

  onAuth(cb) {
    authListeners.add(cb);
    // fire immediately like Firebase does
    queueMicrotask(() => cb(state.currentUser));
    return () => authListeners.delete(cb);
  },

  // ---- users ----
  getUser(uid) {
    return state.users[uid] || null;
  },
  createUser(uid, data) {
    state.users[uid] = { id: uid, createdAt: Date.now(), ...data };
    persist();
    return state.users[uid];
  },
  updateUser(uid, patch) {
    state.users[uid] = { ...state.users[uid], ...patch };
    persist();
    // keep currentUser display in sync
    if (state.currentUser && state.currentUser.uid === uid) {
      if (patch.displayName) state.currentUser.displayName = patch.displayName;
      emitAuth();
    }
  },

  // ---- sightings ----
  createSighting(data) {
    const id = uid();
    state.sightings.unshift({ id, ...data, createdAt: Date.now() });
    persist();
    return id;
  },
  listSightings({ reporterUid, publicOnly } = {}) {
    let rows = [...state.sightings];
    if (reporterUid) rows = rows.filter((r) => r.reporterUid === reporterUid);
    if (publicOnly) rows = rows.filter((r) => r.isPublic === true);
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return rows;
  },
  updateSighting(id, patch) {
    const idx = state.sightings.findIndex((s) => s.id === id);
    if (idx >= 0) {
      state.sightings[idx] = { ...state.sightings[idx], ...patch };
      persist();
    }
  },
  deleteSighting(id) {
    state.sightings = state.sightings.filter((s) => s.id !== id);
    persist();
  },

  // ---- interviews ----
  listInterviews() {
    return [...state.interviews].sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  createInterview(data) {
    const id = uid();
    state.interviews.push({ id, ...data });
    persist();
    return id;
  },
  updateInterview(id, patch) {
    const i = state.interviews.findIndex((iv) => iv.id === id);
    if (i >= 0) {
      state.interviews[i] = { ...state.interviews[i], ...patch };
      persist();
    }
  },
  deleteInterview(id) {
    state.interviews = state.interviews.filter((iv) => iv.id !== id);
    persist();
  },

  // ---- ebook ----
  getEbook() {
    return { ...state.ebook };
  },
  updateEbook(patch) {
    state.ebook = { ...state.ebook, ...patch };
    persist();
  },

  _state: state,
};
