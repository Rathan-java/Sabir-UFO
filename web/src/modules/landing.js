// Signed-out landing page — hero, sign-in CTA, brief feature strip.

import { el } from './ui.js';
import { signIn } from './auth.js';

export function renderLanding() {
  const view = document.getElementById('view');
  view.innerHTML = '';

  const hero = el('section', { class: 'hero' });
  hero.append(el('div', { class: 'tag' }, 'DOCUMENTING UFO ENCOUNTERS'));
  hero.append(el('h1', {}, 'Sabir UFO'));
  hero.append(el('p', {},
    'A serious archive for people who have seen something they cannot explain. Report what you witnessed, browse field interviews, and contribute to ongoing investigation.'));

  const ctaRow = el('div', { class: 'row', style: 'justify-content:center;gap:14px;margin-top:8px' });
  ctaRow.append(el('button', { class: 'btn btn-google', onclick: signIn }, [googleIcon(), 'Continue with Google']));
  ctaRow.append(el('a', { class: 'btn btn-ghost', href: '#/interviews' }, 'Browse interviews'));
  hero.append(ctaRow);
  view.append(hero);

  const grid = el('div', { class: 'cards-grid' });
  grid.append(featureCard('🛸', 'Easy-to-fill report',
    'Pick a category in plain language, attach photos and videos, record where and when you saw it, and how long it lasted.'));
  grid.append(featureCard('🛰️', 'Reviewed by the researcher',
    'Every report is read and reviewed. You will see status updates on your own reports as they are evaluated.'));
  grid.append(featureCard('🌍', 'Global map',
    'Browse public sightings reported worldwide on an interactive map.'));
  view.append(grid);
}

function featureCard(icon, title, body) {
  return el('div', { class: 'feature-card', style: 'cursor:default' }, [
    el('span', { class: 'icon' }, icon),
    el('h3', {}, title),
    el('p', {}, body),
  ]);
}

function googleIcon() {
  const span = document.createElement('span');
  span.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a10.97 10.97 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>`;
  return span.firstChild;
}
