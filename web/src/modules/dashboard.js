// Dashboard view — three primary cards + welcome strip.

import { el, icon } from './ui.js';
import { getSession, isAdmin } from './auth.js';

export function renderDashboard() {
  const view = document.getElementById('view');
  view.innerHTML = '';
  const s = getSession();

  const hero = el('section', { class: 'hero hero-sm' });
  hero.append(el('h1', {}, `Welcome back${s.profile?.displayName ? ', ' + escapeFirstName(s.profile.displayName) : ''}.`));
  hero.append(el('p', {}, 'Submit a new sighting, browse interviews, or review your past reports.'));
  view.append(hero);

  const grid = el('div', { class: 'cards-grid' });
  grid.append(card('ufo', 'Report a UFO Sighting',
    'Submit a report with photos, videos, location, and an easy-to-pick category.',
    '#/report'));
  grid.append(card('book', 'eBook',
    'Get the researcher\'s book on UFO encounters. Purchase is handled directly via WhatsApp.',
    '#/ebook'));
  grid.append(card('video', 'UFO Interviews',
    'Watch curated YouTube interviews with pilots, witnesses, and investigators.',
    '#/interviews'));
  view.append(grid);

  const secondary = el('div', { class: 'cards-grid', style: 'margin-top:14px' });
  secondary.append(card('folder', 'My Reports',
    'Track the status of every sighting you have submitted.', '#/reports'));
  secondary.append(card('map', 'Sightings Map',
    'See public sightings reported across India.', '#/map'));
  if (isAdmin()) {
    secondary.append(card('shield', 'Admin Console',
      'Review every incoming report with media, analytics, and search.', '#/admin'));
  }
  view.append(secondary);
}

function card(iconName, title, body, href) {
  return el('a', { class: 'feature-card', href }, [
    el('span', { class: 'arrow', html: '&rarr;' }),
    icon(iconName, { size: 28, className: 'feature-icon' }),
    el('h3', {}, title),
    el('p', {}, body),
  ]);
}

function escapeFirstName(s) {
  if (!s) return '';
  return s.split(' ')[0];
}
