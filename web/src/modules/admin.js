// Admin dashboard — reads ALL sightings, with analytics, filters, and inline
// status / notes editing. Restricted to users with role === 'admin'.

import { el, $, $$, debounce, fmtDate, fmtDateShort, lightbox, escapeHtml, toast } from './ui.js';
import { isAdmin, getSession } from './auth.js';
import { listAllSightings, updateSighting } from './firebase.js';
import { STATUSES, HYNEK_CLASSIFICATIONS } from './config.js';
import { navigate } from './router.js';

let _allRows = [];
let _filters = { search: '', status: '', classification: '', from: '', to: '' };

export async function renderAdmin() {
  const view = document.getElementById('view');
  view.innerHTML = '';

  if (!isAdmin()) {
    view.append(el('div', { class: 'empty-state' }, [
      el('span', { class: 'big' }, '🚫'),
      el('div', {}, 'Admin access only.'),
      el('a', { class: 'btn btn-ghost', href: '#/dashboard', style: 'margin-top:14px' }, 'Back to dashboard'),
    ]));
    return;
  }

  view.append(el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'Admin Console'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Dashboard'),
  ]));

  view.append(loadingState());

  _allRows = await listAllSightings();

  view.innerHTML = '';
  view.append(el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'Admin Console'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Dashboard'),
  ]));

  view.append(renderStats(_allRows));
  view.append(renderChart(_allRows));
  view.append(renderFilters());

  const listWrap = el('div', { id: 'adminList' });
  view.append(listWrap);
  renderList(listWrap);
}

function renderStats(rows) {
  const total = rows.length;
  const pending = rows.filter((r) => (r.status || 'pending') === 'pending').length;
  const verified = rows.filter((r) => r.status === 'verified').length;
  const thisMonth = rows.filter((r) => {
    const d = toDate(r.createdAt) || toDate(r.sightedAt);
    if (!d) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const strip = el('div', { class: 'stats-strip' });
  strip.append(stat(total, 'Total sightings'));
  strip.append(stat(pending, 'Pending review'));
  strip.append(stat(verified, 'Verified'));
  strip.append(stat(thisMonth, 'This month'));
  return strip;
}

function stat(v, k) {
  return el('div', { class: 'stat' }, [
    el('div', { class: 'v' }, String(v)),
    el('div', { class: 'k' }, k),
  ]);
}

function renderChart(rows) {
  const counts = new Map();
  for (const r of rows) {
    const k = r.classification || 'Unknown';
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const entries = HYNEK_CLASSIFICATIONS
    .map((c) => [c, counts.get(c) || 0])
    .filter(([, n]) => n > 0);
  if (counts.has('Unknown')) entries.push(['Unknown', counts.get('Unknown')]);
  const max = Math.max(1, ...entries.map(([, n]) => n));

  const wrap = el('div', {});
  wrap.append(el('h3', {}, 'Sightings by classification'));
  const chart = el('div', { class: 'bar-chart' });
  if (!entries.length) {
    chart.append(el('div', { class: 'muted', style: 'margin:auto' }, 'No data yet'));
  } else {
    for (const [label, n] of entries) {
      const bar = el('div', { class: 'bar', title: `${label}: ${n}` });
      const v = el('div', { class: 'v' });
      v.style.height = `${(n / max) * 100}%`;
      bar.append(v);
      bar.append(el('div', { class: 'l' }, shortLabel(label)));
      chart.append(bar);
    }
  }
  wrap.append(chart);
  return wrap;
}

function shortLabel(s) {
  if (s.includes('First')) return 'CE-1';
  if (s.includes('Second')) return 'CE-2';
  if (s.includes('Third')) return 'CE-3';
  if (s.includes('Fourth')) return 'CE-4';
  if (s.includes('Fifth')) return 'CE-5';
  if (s.includes('Radar')) return 'Radar';
  if (s.includes('Nocturnal')) return 'Nocturnal';
  if (s.includes('Daylight')) return 'Daylight';
  return s.slice(0, 10);
}

function renderFilters() {
  const row = el('div', { class: 'filter-row' });

  const search = el('input', { id: 'fSearch', type: 'search', placeholder: 'Search description, reporter, place…' });
  search.value = _filters.search;
  search.addEventListener('input', debounce((e) => {
    _filters.search = e.target.value.trim().toLowerCase();
    renderList($('#adminList'));
  }, 200));
  row.append(search);

  const status = el('select', { id: 'fStatus' });
  status.append(el('option', { value: '' }, 'All statuses'));
  for (const s of STATUSES) status.append(el('option', { value: s }, s));
  status.value = _filters.status;
  status.addEventListener('change', (e) => { _filters.status = e.target.value; renderList($('#adminList')); });
  row.append(status);

  const cls = el('select', { id: 'fClass' });
  cls.append(el('option', { value: '' }, 'All classifications'));
  for (const c of HYNEK_CLASSIFICATIONS) cls.append(el('option', { value: c }, shortLabel(c)));
  cls.value = _filters.classification;
  cls.addEventListener('change', (e) => { _filters.classification = e.target.value; renderList($('#adminList')); });
  row.append(cls);

  const from = el('input', { id: 'fFrom', type: 'date' });
  from.value = _filters.from;
  from.title = 'Sighted from';
  from.addEventListener('change', (e) => { _filters.from = e.target.value; renderList($('#adminList')); });
  row.append(from);

  const to = el('input', { id: 'fTo', type: 'date' });
  to.value = _filters.to;
  to.title = 'Sighted to';
  to.addEventListener('change', (e) => { _filters.to = e.target.value; renderList($('#adminList')); });
  row.append(to);

  row.append(el('button', {
    class: 'btn btn-ghost', type: 'button',
    onclick: () => { _filters = { search: '', status: '', classification: '', from: '', to: '' }; renderAdmin(); },
  }, 'Reset'));

  return row;
}

function filterRows(rows) {
  const { search, status, classification, from, to } = _filters;
  const fromTs = from ? new Date(from).getTime() : -Infinity;
  const toTs = to ? new Date(to).getTime() + 86400000 - 1 : Infinity;
  return rows.filter((r) => {
    if (status && (r.status || 'pending') !== status) return false;
    if (classification && r.classification !== classification) return false;
    const sightTs = toDate(r.sightedAt)?.getTime() ?? toDate(r.createdAt)?.getTime() ?? 0;
    if (sightTs < fromTs || sightTs > toTs) return false;
    if (search) {
      const blob = [
        r.description, r.reporterName, r.reporterEmail,
        r.location?.place, r.objectShape, r.classification,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!blob.includes(search)) return false;
    }
    return true;
  });
}

function renderList(container) {
  container.innerHTML = '';
  const rows = filterRows(_allRows);
  container.append(el('div', { class: 'muted', style: 'margin-bottom:10px;font-size:13px' },
    `${rows.length} of ${_allRows.length} sightings`));
  if (!rows.length) {
    container.append(el('div', { class: 'empty-state' }, 'No matching sightings.'));
    return;
  }
  for (const r of rows) container.append(adminCard(r));
}

function adminCard(r) {
  const card = el('div', { class: 'report-card' });

  const head = el('div', { class: 'head' });
  const left = el('div');
  left.append(el('div', { class: 'row gap-sm', style: 'margin-bottom:6px' }, [
    el('span', { class: 'badge class' }, r.classification || '—'),
    el('span', { class: `badge ${r.status || 'pending'}` }, (r.status || 'pending').toUpperCase()),
    r.isPublic ? el('span', { class: 'badge', style: 'color:#6bffb3' }, 'PUBLIC') : null,
  ]));
  left.append(el('div', { class: 'meta' }, [
    `${escapeHtml(r.reporterName || 'Unknown')}`,
    ' · ',
    el('span', { class: 'dim' }, escapeHtml(r.reporterEmail || '')),
  ]));
  left.append(el('div', { class: 'meta' }, [
    `${r.objectShape || '—'} · ${r.witnessCount || 1} witness${r.witnessCount === 1 ? '' : 'es'}`,
    ' · ',
    r.location?.place || (r.location?.lat ? `${r.location.lat.toFixed(3)}, ${r.location.lng.toFixed(3)}` : 'no location'),
    ' · ',
    r.durationText || '—',
  ]));
  head.append(left);
  head.append(el('div', { class: 'meta', style: 'text-align:right' }, [
    el('div', {}, fmtDate(r.sightedAt)),
    el('div', { class: 'dim', style: 'font-size:10px;text-transform:uppercase;letter-spacing:0.1em' }, 'sighted'),
    el('div', { style: 'margin-top:4px' }, fmtDate(r.createdAt)),
    el('div', { class: 'dim', style: 'font-size:10px;text-transform:uppercase;letter-spacing:0.1em' }, 'submitted'),
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

  // Status + notes editor
  const editor = el('div', { class: 'row gap-sm', style: 'flex-wrap:wrap' });
  const statusSel = el('select', { style: 'padding:8px 12px;background:rgba(7,11,26,0.7);color:var(--text);border:1px solid var(--border);border-radius:10px' });
  for (const s of STATUSES) {
    const opt = el('option', { value: s }, s);
    if ((r.status || 'pending') === s) opt.setAttribute('selected', '');
    statusSel.append(opt);
  }
  editor.append(statusSel);

  const notesInput = el('input', {
    type: 'text', placeholder: 'Private admin notes…', value: r.adminNotes || '',
    style: 'flex:1;min-width:200px;padding:8px 12px;background:rgba(7,11,26,0.7);color:var(--text);border:1px solid var(--border);border-radius:10px',
  });
  editor.append(notesInput);

  const saveBtn = el('button', { class: 'btn btn-primary', type: 'button' }, 'Save');
  editor.append(saveBtn);

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    try {
      const patch = { status: statusSel.value, adminNotes: notesInput.value.trim() };
      await updateSighting(r.id, patch);
      Object.assign(r, patch);
      toast('Updated', 'success');
      // refresh stats/chart without full reload
      const view = document.getElementById('view');
      const oldStats = view.querySelector('.stats-strip');
      const oldChart = view.querySelector('.bar-chart')?.parentElement;
      if (oldStats) oldStats.replaceWith(renderStats(_allRows));
      if (oldChart) oldChart.replaceWith(renderChart(_allRows));
      // re-render the badge in the card
      const badge = card.querySelector('.badge.pending,.badge.reviewed,.badge.verified,.badge.rejected');
      if (badge) {
        badge.className = `badge ${patch.status}`;
        badge.textContent = patch.status.toUpperCase();
      }
    } catch (err) {
      console.error(err);
      toast(err.message || 'Save failed', 'error');
    } finally {
      saveBtn.disabled = false; saveBtn.textContent = 'Save';
    }
  });

  card.append(editor);

  return card;
}

function loadingState() {
  return el('div', { class: 'empty-state' }, [
    el('span', { class: 'spinner' }),
    el('div', { style: 'margin-top:10px' }, 'Loading admin console…'),
  ]);
}

function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v?.toDate === 'function') return v.toDate();
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') return new Date(v);
  if (v?.seconds != null) return new Date(v.seconds * 1000);
  return null;
}
