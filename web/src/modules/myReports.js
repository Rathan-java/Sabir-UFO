// "My Reports" — user sees their own sightings + status.

import { el, fmtDate, lightbox, escapeHtml, toast } from './ui.js';
import { getSession } from './auth.js';
import { listMySightings } from './firebase.js';
import { navigate } from './router.js';

export async function renderMyReports() {
  const view = document.getElementById('view');
  view.innerHTML = '';
  const s = getSession();
  if (!s.user) { navigate('#/'); return; }

  const header = () => el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'My Reports'),
    el('a', { class: 'btn btn-primary', href: '#/report' }, '+ New sighting'),
  ]);

  view.append(header());
  view.append(loadingState());

  let rows;
  try {
    rows = await listMySightings(s.user.uid);
  } catch (err) {
    view.innerHTML = '';
    view.append(header());
    view.append(renderQueryError(err, 'My Reports'));
    console.error('[my-reports]', err);
    return;
  }

  view.innerHTML = '';
  view.append(header());

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

function renderQueryError(err, viewName) {
  const msg = (err?.message || String(err)).toString();
  // Firestore embeds a "click here to create the index" URL in the error message
  // when a composite index is missing. Surface it as a button.
  const indexUrl = msg.match(/https:\/\/console\.firebase\.google\.com\/[^\s)]+/)?.[0];
  const wrap = el('div', { class: 'panel', style: 'border-color: var(--red); background: rgba(255, 107, 138, 0.06)' });
  wrap.append(el('h3', { style: 'margin-top:0; color: var(--red)' },
    `Couldn't load ${viewName}`));
  if (indexUrl) {
    wrap.append(el('p', { class: 'muted', style: 'margin: 0 0 12px' },
      'A Firestore composite index is missing. Firebase generated a one-click link to create it — open it (signed in as the project owner) and click "Create index". The index takes ~1 minute to build, then refresh this page.'));
    wrap.append(el('a', {
      class: 'btn btn-primary', href: indexUrl, target: '_blank', rel: 'noopener noreferrer',
    }, '🔧 Open Firebase to create the index'));
  } else {
    wrap.append(el('p', { class: 'muted' }, msg));
  }
  wrap.append(el('details', { style: 'margin-top:12px' }, [
    el('summary', { class: 'dim', style: 'cursor:pointer;font-size:12px' }, 'Technical details'),
    el('pre', { style: 'font-size:11px;color:var(--text-faint);white-space:pre-wrap;word-break:break-word;margin-top:8px' }, msg),
  ]));
  return wrap;
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
