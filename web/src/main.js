// Sabir UFO — web entry point.
// Wires the starfield, router, auth, and every view module.

import './styles/main.css';

import { startStarfield } from './modules/starfield.js';
import { route, startRouter, navigate, currentPath } from './modules/router.js';
import { initAuth, getSession, signIn, signOutCurrent, isDemo, onSession } from './modules/auth.js';
import { el, setActiveNav } from './modules/ui.js';
import { fallbackAvatar } from './modules/profile.js';
import { config } from './modules/config.js';

import { renderLanding } from './modules/landing.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderProfile } from './modules/profile.js';
import { renderReport } from './modules/report.js';
import { renderMyReports } from './modules/myReports.js';
import { renderMap } from './modules/map.js';
import { renderInterviews } from './modules/interviews.js';
import { renderEbook } from './modules/ebook.js';
import { renderAdmin } from './modules/admin.js';

// ---- starfield ----
startStarfield();

// ---- year ----
document.getElementById('year').textContent = String(new Date().getFullYear());

// ---- demo banner ----
if (isDemo()) {
  const banner = el('div', { class: 'demo-banner' }, [
    '🛰️ Demo mode — using mock data in your browser. Set ',
    el('code', {}, 'VITE_DEMO_MODE=false'),
    ' in ',
    el('code', {}, 'web/.env'),
    ' once your Firebase config is in.',
  ]);
  const headerEl = document.getElementById('appHeader');
  headerEl.insertAdjacentElement('afterend', banner);
}

// ---- routes ----
route('/', () => {
  const s = getSession();
  if (s.user) renderDashboard();
  else renderLanding();
});
route('/dashboard', () => requireAuth(renderDashboard));
route('/profile', () => requireAuth(renderProfile));
route('/report', () => requireAuth(renderReport));
route('/reports', () => requireAuth(renderMyReports));
route('/map', () => renderMap());
route('/interviews', () => renderInterviews());
route('/ebook', () => renderEbook());
route('/admin', () => requireAuth(renderAdmin));

function requireAuth(fn) {
  const s = getSession();
  if (!s.ready) {
    // wait for session to be ready, then re-dispatch
    document.getElementById('view').innerHTML =
      '<div class="empty-state"><span class="spinner"></span><div style="margin-top:10px">Loading…</div></div>';
    return;
  }
  if (!s.user) {
    renderLanding();
    return;
  }
  fn();
}

// ---- auth-bound UI ----
const authArea = document.getElementById('authArea');
const navLinks = document.getElementById('navLinks');
const navAdmin = document.getElementById('navAdmin');

function renderAuthArea() {
  authArea.innerHTML = '';
  const s = getSession();
  if (!s.ready) {
    authArea.append(el('span', { class: 'spinner' }));
    return;
  }
  if (!s.user) {
    navLinks.hidden = true;
    authArea.append(el('button', { class: 'btn btn-google', onclick: signIn },
      [googleIcon(), 'Sign in']));
    return;
  }
  navLinks.hidden = false;
  navAdmin.hidden = !(s.profile?.role === 'admin');

  const wrap = el('a', {
    href: '#/profile',
    class: 'profile-row',
    style: 'text-decoration:none;color:inherit',
    title: 'Open profile',
  });
  wrap.append(el('img', {
    class: 'avatar',
    src: s.profile?.photoURL || s.user.photoURL || fallbackAvatar(s.profile?.displayName),
    alt: '',
  }));
  const text = el('div', { style: 'line-height:1.2' });
  text.append(el('div', { class: 'profile-name' }, s.profile?.displayName || ''));
  text.append(el('div', { class: 'profile-email' }, s.profile?.email || s.user.email || ''));
  wrap.append(text);
  authArea.append(wrap);

  authArea.append(el('button', { class: 'btn btn-ghost', onclick: async () => {
    await signOutCurrent();
    navigate('#/');
  } }, 'Sign out'));
}

// ---- init ----
initAuth();

let lastUserUid = null;
let lastReady = false;
onSession((s) => {
  renderAuthArea();
  setActiveNav(location.hash);
  // re-render protected pages when auth state flips meaningfully
  const userChanged = (s.user?.uid || null) !== lastUserUid;
  const justBecameReady = !lastReady && s.ready;
  lastUserUid = s.user?.uid || null;
  lastReady = s.ready;
  if (s.ready && (userChanged || justBecameReady)) {
    const path = currentPath();
    if (
      path === '/' || path === '/dashboard' || path === '/profile' ||
      path === '/report' || path === '/reports' || path === '/admin' || path === '/map'
    ) {
      // re-dispatch
      const ev = new HashChangeEvent('hashchange');
      window.dispatchEvent(ev);
    }
  }
});

window.addEventListener('hashchange', () => setActiveNav(location.hash));

startRouter();

function googleIcon() {
  const span = document.createElement('span');
  span.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a10.97 10.97 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>`;
  return span.firstChild;
}
