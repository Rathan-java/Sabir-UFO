// Firebase initialization + a thin abstraction so demo mode can swap in mocks.
// In demo mode we never touch real Firebase — we fall back to mockStore.

import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, query, where, orderBy, getDocs, onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore';

import { config } from './config.js';
import { mockStore } from './mockStore.js';

let app = null;
let auth = null;
let db = null;
let provider = null;

if (!config.demoMode) {
  try {
    app = initializeApp(config.firebase);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
  } catch (err) {
    console.error('[sabir-ufo] Firebase init failed; falling back to demo mode.', err);
    config.demoMode = true;
  }
}

export const isDemo = () => config.demoMode;

// -------- Auth --------
export async function signInGoogle() {
  if (isDemo()) return mockStore.demoSignIn();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutUser() {
  if (isDemo()) return mockStore.demoSignOut();
  return signOut(auth);
}

export function onAuth(cb) {
  if (isDemo()) return mockStore.onAuth(cb);
  return onAuthStateChanged(auth, cb);
}

// -------- Users --------
export async function getUserProfile(uid) {
  if (isDemo()) return mockStore.getUser(uid);
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createUserProfile(uid, data) {
  if (isDemo()) return mockStore.createUser(uid, data);
  await setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() });
  return getUserProfile(uid);
}

export async function updateUserProfile(uid, patch) {
  if (isDemo()) return mockStore.updateUser(uid, patch);
  await updateDoc(doc(db, 'users', uid), patch);
}

// -------- Sightings --------
export async function createSighting(data) {
  if (isDemo()) return mockStore.createSighting(data);
  const ref = await addDoc(collection(db, 'sightings'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listMySightings(uid) {
  if (isDemo()) return mockStore.listSightings({ reporterUid: uid });
  const q = query(
    collection(db, 'sightings'),
    where('reporterUid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listAllSightings() {
  if (isDemo()) return mockStore.listSightings({});
  const q = query(collection(db, 'sightings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listPublicSightings() {
  if (isDemo()) return mockStore.listSightings({ publicOnly: true });
  const q = query(
    collection(db, 'sightings'),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateSighting(id, patch) {
  if (isDemo()) return mockStore.updateSighting(id, patch);
  await updateDoc(doc(db, 'sightings', id), patch);
}

export async function deleteSighting(id) {
  if (isDemo()) return mockStore.deleteSighting(id);
  await deleteDoc(doc(db, 'sightings', id));
}

// -------- Interviews --------
export async function listInterviews() {
  if (isDemo()) return mockStore.listInterviews();
  const q = query(collection(db, 'interviews'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createInterview(data) {
  if (isDemo()) return mockStore.createInterview(data);
  const ref = await addDoc(collection(db, 'interviews'), data);
  return ref.id;
}

export async function updateInterview(id, patch) {
  if (isDemo()) return mockStore.updateInterview(id, patch);
  await updateDoc(doc(db, 'interviews', id), patch);
}

export async function deleteInterview(id) {
  if (isDemo()) return mockStore.deleteInterview(id);
  await deleteDoc(doc(db, 'interviews', id));
}

// -------- eBook --------
export async function getEbookConfig() {
  if (isDemo()) return mockStore.getEbook();
  const snap = await getDoc(doc(db, 'ebook', 'config'));
  return snap.exists() ? snap.data() : null;
}

export async function updateEbookConfig(data) {
  if (isDemo()) return mockStore.updateEbook(data);
  await setDoc(doc(db, 'ebook', 'config'), data, { merge: true });
}

// -------- helpers --------
export function timestampToDate(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (ts.toDate) return ts.toDate();
  if (ts.seconds != null) return new Date(ts.seconds * 1000);
  if (typeof ts === 'number') return new Date(ts);
  if (typeof ts === 'string') return new Date(ts);
  return null;
}

export const _internal = { Timestamp, onSnapshot };
