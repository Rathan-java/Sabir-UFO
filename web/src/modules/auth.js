// Session state + Google sign-in glue. Wires Firebase auth → user profile in Firestore,
// elevates to admin if the signed-in email matches VITE_ADMIN_EMAIL.

import { config } from './config.js';
import {
  onAuth, signInGoogle, signOutUser,
  getUserProfile, createUserProfile, updateUserProfile, isDemo,
} from './firebase.js';
import { toast } from './ui.js';

const listeners = new Set();
let session = { user: null, profile: null, ready: false };

export function getSession() { return session; }

export function onSession(cb) {
  listeners.add(cb);
  cb(session);
  return () => listeners.delete(cb);
}

function emit() { listeners.forEach((cb) => cb(session)); }

export function isAdmin() {
  return !!session.profile && session.profile.role === 'admin';
}

export async function signIn() {
  try {
    await signInGoogle();
  } catch (err) {
    console.error(err);
    toast(err?.message || 'Sign-in failed', 'error');
  }
}

export async function signOutCurrent() {
  await signOutUser();
  toast('Signed out', 'info');
}

export async function updateMyName(displayName) {
  if (!session.user) return;
  await updateUserProfile(session.user.uid, { displayName });
  session.profile = { ...session.profile, displayName };
  emit();
  toast('Profile updated', 'success');
}

function shouldBeAdmin(email) {
  return !!config.adminEmail && email && email.toLowerCase() === config.adminEmail;
}

export function initAuth() {
  onAuth(async (user) => {
    if (!user) {
      session = { user: null, profile: null, ready: true };
      emit();
      return;
    }
    let profile = await getUserProfile(user.uid);
    if (!profile) {
      profile = await createUserProfile(user.uid, {
        displayName: user.displayName || (user.email || 'Explorer').split('@')[0],
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: shouldBeAdmin(user.email) ? 'admin' : 'user',
      });
      toast(`Welcome, ${profile.displayName}!`, 'success');
    } else if (shouldBeAdmin(user.email) && profile.role !== 'admin') {
      // promote on next login if env was updated
      await updateUserProfile(user.uid, { role: 'admin' });
      profile = { ...profile, role: 'admin' };
    }
    session = { user, profile, ready: true };
    emit();
  });
}

export { isDemo };
