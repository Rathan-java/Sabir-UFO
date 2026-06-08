// Admin dashboard — sightings review + interviews + eBook management.
// Restricted to users with role === 'admin'.

import { el, $, $$, debounce, fmtDate, fmtDateShort, lightbox, escapeHtml, toast } from './ui.js';
import { isAdmin, getSession } from './auth.js';
import {
  listAllSightings, updateSighting,
  listInterviews, createInterview, updateInterview, deleteInterview,
  getEbookConfig, updateEbookConfig,
} from './firebase.js';
import { STATUSES, HYNEK_CLASSIFICATIONS } from './config.js';
import { navigate } from './router.js';

let _allRows = [];
let _filters = { search: '', status: '', classification: '', from: '', to: '' };
let _currentTab = 'sightings';

export async function renderAdmin({ query } = {}) {
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

  _currentTab = (query?.tab) || _currentTab || 'sightings';

  view.append(el('div', { class: 'row between', style: 'margin-bottom:14px' }, [
    el('h2', { style: 'margin:0' }, 'Admin Console'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Dashboard'),
  ]));

  view.append(renderTabs(_currentTab));

  const body = el('div', { id: 'adminBody' });
  view.append(body);

  if (_currentTab === 'interviews') {
    await renderInterviewsTab(body);
  } else if (_currentTab === 'ebook') {
    await renderEbookTab(body);
  } else {
    await renderSightingsTab(body);
  }
}

function renderTabs(active) {
  const tabs = [
    { id: 'sightings', label: '🛸 Sightings' },
    { id: 'interviews', label: '🎥 Interviews' },
    { id: 'ebook', label: '📖 eBook' },
  ];
  const bar = el('div', { class: 'admin-tabs' });
  for (const t of tabs) {
    const a = el('a', {
      href: `#/admin?tab=${t.id}`,
      class: `admin-tab${active === t.id ? ' active' : ''}`,
    }, t.label);
    bar.append(a);
  }
  return bar;
}

// ============================================================
// TAB 1 — Sightings (the original admin view)
// ============================================================
async function renderSightingsTab(body) {
  body.append(loadingState());
  _allRows = await listAllSightings();
  body.innerHTML = '';
  body.append(renderStats(_allRows));
  body.append(renderChart(_allRows));
  body.append(renderFilters());
  const listWrap = el('div', { id: 'adminList' });
  body.append(listWrap);
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

// ============================================================
// TAB 2 — Interviews management
// ============================================================
async function renderInterviewsTab(body) {
  body.append(loadingState());
  const rows = await listInterviews();
  body.innerHTML = '';

  body.append(el('div', { class: 'panel', style: 'margin-bottom:18px' }, [
    el('h3', { style: 'margin-top:0' }, 'Add a new interview'),
    el('p', { class: 'muted', style: 'font-size:13px;margin-top:0' },
      'Paste a YouTube video ID (e.g. from `youtube.com/watch?v=ABC123`, the ID is `ABC123`).'),
    interviewForm({}, async (data) => {
      await createInterview(data);
      toast('Interview added', 'success');
      renderInterviewsTab(body);
    }),
  ]));

  body.append(el('h3', {}, `Existing interviews (${rows.length})`));

  if (!rows.length) {
    body.append(el('div', { class: 'empty-state' }, [
      el('span', { class: 'big' }, '🎥'),
      el('div', {}, 'No interviews yet — use the form above to add your first one.'),
    ]));
    return;
  }

  for (const iv of rows) {
    const card = el('div', { class: 'panel', style: 'margin-bottom:12px' });
    card.append(el('div', { class: 'row gap-sm', style: 'margin-bottom:10px;align-items:flex-start' }, [
      el('img', {
        src: `https://img.youtube.com/vi/${encodeURIComponent(iv.youtubeId || '')}/mqdefault.jpg`,
        alt: '',
        style: 'width:120px;border-radius:8px;border:1px solid var(--border);flex-shrink:0',
        onerror: function () { this.style.display = 'none'; },
      }),
      el('div', { style: 'flex:1' }, [
        el('div', { style: 'font-weight:600' }, iv.title || '—'),
        el('div', { class: 'meta', style: 'font-size:12px' }, [
          `YouTube ID: ${iv.youtubeId || '—'} · Order: ${iv.order ?? '—'} · `,
          fmtDateShort(iv.publishedAt),
        ]),
      ]),
    ]));
    card.append(interviewForm(iv, async (data) => {
      await updateInterview(iv.id, data);
      toast('Interview updated', 'success');
      renderInterviewsTab(body);
    }, async () => {
      if (!confirm(`Delete "${iv.title}"? This cannot be undone.`)) return;
      await deleteInterview(iv.id);
      toast('Interview deleted', 'info');
      renderInterviewsTab(body);
    }));
    body.append(card);
  }
}

function interviewForm(initial, onSave, onDelete) {
  const form = el('form', { class: 'form', style: 'margin:0' });

  const titleField = el('div', { class: 'field' });
  titleField.append(el('label', {}, 'Title'));
  titleField.append(el('input', {
    type: 'text', name: 'title', value: initial.title || '',
    required: true, maxlength: 200,
    placeholder: 'e.g. The Nimitz Encounter — A Pilot\'s Account',
  }));
  form.append(titleField);

  const row = el('div', { class: 'form-row' });

  const ytField = el('div', { class: 'field' });
  ytField.append(el('label', {}, 'YouTube video ID'));
  ytField.append(el('input', {
    type: 'text', name: 'youtubeId', value: initial.youtubeId || '',
    required: true, maxlength: 30,
    placeholder: 'e.g. dQw4w9WgXcQ',
  }));
  row.append(ytField);

  const orderField = el('div', { class: 'field' });
  orderField.append(el('label', {}, 'Display order (lower = shown first)'));
  orderField.append(el('input', {
    type: 'number', name: 'order', value: initial.order ?? 1,
    min: 0, max: 9999,
  }));
  row.append(orderField);

  form.append(row);

  const dateField = el('div', { class: 'field' });
  dateField.append(el('label', {}, 'Published date'));
  const pubVal = initial.publishedAt
    ? new Date(toDate(initial.publishedAt) || initial.publishedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  dateField.append(el('input', { type: 'date', name: 'publishedAt', value: pubVal }));
  form.append(dateField);

  const actions = el('div', { class: 'row gap-sm', style: 'margin-top:6px' });
  const saveBtn = el('button', { type: 'submit', class: 'btn btn-primary' }, initial.id ? 'Save changes' : 'Add interview');
  actions.append(saveBtn);
  if (onDelete) {
    actions.append(el('button', { type: 'button', class: 'btn btn-danger', onclick: onDelete }, 'Delete'));
  }
  form.append(actions);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString().trim();
    const youtubeId = (fd.get('youtubeId') || '').toString().trim();
    if (!title || !youtubeId) { toast('Title and YouTube ID are required', 'error'); return; }
    saveBtn.disabled = true;
    const original = saveBtn.textContent;
    saveBtn.textContent = 'Saving…';
    try {
      await onSave({
        title,
        youtubeId,
        order: parseInt(fd.get('order'), 10) || 1,
        publishedAt: fd.get('publishedAt')
          ? new Date(fd.get('publishedAt')).getTime()
          : Date.now(),
      });
    } catch (err) {
      console.error(err);
      toast(err.message || 'Failed to save', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = original;
    }
  });

  return form;
}

// ============================================================
// TAB 3 — eBook config
// ============================================================
async function renderEbookTab(body) {
  body.append(loadingState());
  const existing = (await getEbookConfig()) || {};
  body.innerHTML = '';

  const wrap = el('div', { class: 'panel' });
  wrap.append(el('h3', { style: 'margin-top:0' }, 'eBook details'));
  wrap.append(el('p', { class: 'muted', style: 'font-size:13px;margin-top:0' },
    'These show on the public /ebook page. The WhatsApp button uses the global admin number from .env.'));

  const form = el('form', { class: 'form' });

  const titleField = el('div', { class: 'field' });
  titleField.append(el('label', {}, 'Title'));
  titleField.append(el('input', {
    type: 'text', name: 'title', value: existing.title || '',
    required: true, maxlength: 200,
  }));
  form.append(titleField);

  const blurbField = el('div', { class: 'field' });
  blurbField.append(el('label', {}, 'Blurb / description'));
  blurbField.append(el('textarea', {
    name: 'blurb', maxlength: 1000,
    placeholder: 'A short pitch — 1 to 3 sentences.',
  }, existing.blurb || ''));
  form.append(blurbField);

  const row = el('div', { class: 'form-row' });

  const priceField = el('div', { class: 'field' });
  priceField.append(el('label', {}, 'Price (free-form text, e.g. $19.99 or ₹499)'));
  priceField.append(el('input', {
    type: 'text', name: 'price', value: existing.price || '', maxlength: 40,
  }));
  row.append(priceField);

  const coverField = el('div', { class: 'field' });
  coverField.append(el('label', {}, 'Cover image URL'));
  coverField.append(el('input', {
    type: 'url', name: 'coverImageUrl', value: existing.coverImageUrl || '',
    placeholder: 'https://…',
  }));
  row.append(coverField);

  form.append(row);

  // Live preview
  const previewWrap = el('div', { class: 'panel', style: 'background:rgba(7,11,26,0.6);margin-top:14px' });
  previewWrap.append(el('div', { class: 'dim', style: 'font-size:11px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px' }, 'Live preview'));
  const previewBody = el('div', { class: 'row gap-sm', style: 'gap:14px;align-items:flex-start' });
  const previewImg = el('img', { src: existing.coverImageUrl || '', alt: '', style: 'width:80px;aspect-ratio:2/3;object-fit:cover;border-radius:6px;border:1px solid var(--border);background:var(--bg-2)', onerror: function () { this.style.opacity = 0.2; } });
  const previewText = el('div');
  const previewTitle = el('div', { style: 'font-weight:600' }, existing.title || '(no title)');
  const previewPrice = el('div', { class: 'dim', style: 'font-size:13px' }, existing.price || '(no price)');
  const previewBlurb = el('div', { class: 'muted', style: 'font-size:13px;margin-top:4px' }, existing.blurb || '(no blurb)');
  previewText.append(previewTitle); previewText.append(previewPrice); previewText.append(previewBlurb);
  previewBody.append(previewImg); previewBody.append(previewText);
  previewWrap.append(previewBody);
  form.append(previewWrap);

  form.addEventListener('input', () => {
    const fd = new FormData(form);
    previewTitle.textContent = (fd.get('title') || '(no title)').toString();
    previewPrice.textContent = (fd.get('price') || '(no price)').toString();
    previewBlurb.textContent = (fd.get('blurb') || '(no blurb)').toString();
    previewImg.src = (fd.get('coverImageUrl') || '').toString();
  });

  const saveBtn = el('button', { type: 'submit', class: 'btn btn-primary', style: 'margin-top:6px;align-self:flex-start' }, 'Save eBook');
  form.append(saveBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      title: (fd.get('title') || '').toString().trim(),
      blurb: (fd.get('blurb') || '').toString().trim(),
      price: (fd.get('price') || '').toString().trim(),
      coverImageUrl: (fd.get('coverImageUrl') || '').toString().trim(),
    };
    if (!data.title) { toast('Title is required', 'error'); return; }
    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    try {
      await updateEbookConfig(data);
      toast('eBook updated', 'success');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Failed', 'error');
    } finally {
      saveBtn.disabled = false; saveBtn.textContent = 'Save eBook';
    }
  });

  wrap.append(form);
  body.append(wrap);
}
