// "My Reports" — user sees their own sightings + status.

import { el, fmtDate, lightbox, escapeHtml } from './ui.js';
import { getSession } from './auth.js';
import { listMySightings } from './firebase.js';
import { navigate } from './router.js';

export async function renderMyReports() {
  const view = document.getElementById('view');
  view.innerHTML = '';
  const s = getSession();
  if (!s.user) { navigate('#/'); return; }

  view.append(el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'My Reports'),
    el('a', { class: 'btn btn-primary', href: '#/report' }, '+ New sighting'),
  ]));

  view.append(loadingState());

  const rows = await listMySightings(s.user.uid);
  view.innerHTML = '';
  view.append(el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'My Reports'),
    el('a', { class: 'btn btn-primary', href: '#/report' }, '+ New sighting'),
  ]));

  if (!rows.length) {
    view.append(el('div', { class: 'empty-state' }, [
      el('span', { class: 'big' }, '🛸'),
      el('div', {}, 'You haven\'t reported a sighting yet.'),
      el('a', { class: 'btn btn-primary', href: '#/report', style: 'margin-top:14px' }, 'Report one now'),
    ]));
    return;
  }

  for (const r of rows) view.append(reportCard(r));
}

export function reportCard(r) {
  const card = el('div', { class: 'report-card' });

  const head = el('div', { class: 'head' });
  const left = el('div');
  left.append(el('div', { class: 'row gap-sm', style: 'margin-bottom:6px' }, [
    el('span', { class: 'badge class' }, r.classification || '—'),
    el('span', { class: `badge ${r.status || 'pending'}` }, (r.status || 'pending').toUpperCase()),
  ]));
  left.append(el('div', { class: 'meta' }, [
    `${r.objectShape || '—'} · ${r.witnessCount || 1} witness${r.witnessCount === 1 ? '' : 'es'}`,
    ' · ',
    r.location?.place || (r.location?.lat ? `${r.location.lat.toFixed(3)}, ${r.location.lng.toFixed(3)}` : 'no location'),
  ]));
  head.append(left);
  head.append(el('div', { class: 'meta', style: 'text-align:right' }, [
    el('div', {}, fmtDate(r.sightedAt)),
    el('div', { class: 'dim', style: 'font-size:10px;text-transform:uppercase;letter-spacing:0.1em' }, 'sighted'),
  ]));
  card.append(head);

  card.append(el('div', { class: 'desc' }, r.description || ''));

  if (r.media?.length) {
    const gal = el('div', { class: 'gallery' });
    for (const m of r.media) {
      if (m.type === 'video') {
        gal.append(el('video', { src: m.url, muted: true, onclick: () => lightbox(m.url, 'video') }));
      } else {
        gal.append(el('img', { src: m.url, alt: '', loading: 'lazy', onclick: () => lightbox(m.url, 'image') }));
      }
    }
    card.append(gal);
  }

  if (r.adminNotes) {
    card.append(el('div', { class: 'panel', style: 'background:rgba(123,233,255,0.05);padding:12px;border-radius:10px' }, [
      el('div', { class: 'dim', style: 'font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px' }, 'Researcher notes'),
      el('div', {}, r.adminNotes),
    ]));
  }

  return card;
}

function loadingState() {
  return el('div', { class: 'empty-state' }, [
    el('span', { class: 'spinner' }),
    el('div', { style: 'margin-top:10px' }, 'Loading your reports…'),
  ]);
}
