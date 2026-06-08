// Sightings map — Leaflet + OpenStreetMap (free).
// Regular users see public sightings + their own pins.
// Admins see everything.

import L from 'leaflet';
import { el, fmtDateShort, escapeHtml } from './ui.js';
import { getSession, isAdmin } from './auth.js';
import { listPublicSightings, listMySightings, listAllSightings } from './firebase.js';
import { navigate } from './router.js';

export async function renderMap() {
  const view = document.getElementById('view');
  view.innerHTML = '';
  const s = getSession();

  view.append(el('div', { class: 'row between', style: 'margin-bottom:8px' }, [
    el('h2', { style: 'margin:0' }, 'Sightings Map'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Dashboard'),
  ]));
  view.append(el('p', { class: 'muted', style: 'margin-top:0' },
    isAdmin() ? 'All sightings on file.'
              : 'Public sightings + your own reports. Toggle each report\'s "show publicly" to appear here.'));

  const container = el('div', { class: 'map-container', id: 'mapEl' });
  view.append(container);

  // Load data
  let sightings = [];
  try {
    if (isAdmin()) {
      sightings = await listAllSightings();
    } else if (s.user) {
      const [pub, mine] = await Promise.all([
        listPublicSightings(),
        listMySightings(s.user.uid),
      ]);
      const seen = new Set();
      sightings = [...pub, ...mine].filter((r) => (seen.has(r.id) ? false : seen.add(r.id)));
    } else {
      sightings = await listPublicSightings();
    }
  } catch (err) {
    console.error('[map]', err);
    container.remove();
    const msg = (err?.message || String(err)).toString();
    const indexUrl = msg.match(/https:\/\/console\.firebase\.google\.com\/[^\s)]+/)?.[0];
    const wrap = el('div', { class: 'panel', style: 'border-color: var(--red); background: rgba(255, 107, 138, 0.06)' });
    wrap.append(el('h3', { style: 'margin-top:0; color: var(--red)' }, "Couldn't load the map"));
    if (indexUrl) {
      wrap.append(el('p', { class: 'muted', style: 'margin: 0 0 12px' },
        'A Firestore composite index is missing. Firebase generated a one-click link to create it.'));
      wrap.append(el('a', { class: 'btn btn-primary', href: indexUrl, target: '_blank', rel: 'noopener noreferrer' },
        '🔧 Open Firebase to create the index'));
    } else {
      wrap.append(el('p', { class: 'muted' }, msg));
    }
    view.append(wrap);
    return;
  }

  const map = L.map(container, {
    center: [20, 0],
    zoom: 2,
    worldCopyJump: true,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap',
  }).addTo(map);

  const pinIcon = L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:radial-gradient(circle,#7be9ff 0%,#a06bff 70%);
      box-shadow:0 0 12px rgba(123,233,255,0.8),0 0 4px #fff inset;
      border:1px solid rgba(255,255,255,0.6);
      transform:translate(-9px,-9px);
    "></div>`,
    iconSize: [18, 18],
  });

  const bounds = [];
  let plotted = 0;
  for (const r of sightings) {
    if (!r.location?.lat || !r.location?.lng) continue;
    plotted++;
    const showName = isAdmin() || r.isPublic;
    const name = showName ? (r.reporterName || 'Reporter') : 'Anonymous reporter';
    const m = L.marker([r.location.lat, r.location.lng], { icon: pinIcon }).addTo(map);
    m.bindPopup(`
      <div style="min-width:200px;max-width:260px">
        <div style="font-weight:600;margin-bottom:4px">${escapeHtml(r.classification || 'Sighting')}</div>
        <div style="font-size:12px;color:#9aa3c7;margin-bottom:6px">
          ${escapeHtml(r.location.place || '')} · ${fmtDateShort(r.sightedAt)}
        </div>
        <div style="font-size:13px;color:#e7ecff;margin-bottom:8px">
          ${escapeHtml((r.description || '').slice(0, 160))}${(r.description || '').length > 160 ? '…' : ''}
        </div>
        <div style="font-size:11px;color:#6b7299">— ${escapeHtml(name)}</div>
      </div>
    `);
    bounds.push([r.location.lat, r.location.lng]);
  }

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 5);
  }

  if (!plotted) {
    const overlay = el('div', { class: 'empty-state', style: 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;pointer-events:none' }, [
      el('span', { class: 'big' }, '🌍'),
      el('div', {}, 'No sightings with coordinates yet.'),
    ]);
    overlay.style.zIndex = 5;
    container.append(overlay);
  }
}
