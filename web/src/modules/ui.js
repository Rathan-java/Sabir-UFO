// Small UI helpers: toasts, HTML escaping, simple modal lightbox, date fmt.

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v === false || v == null) continue;
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

let toastRoot;
export function toast(message, type = 'info', ttl = 4000) {
  toastRoot ||= document.getElementById('toasts');
  if (!toastRoot) return;
  const t = el('div', { class: `toast ${type}` }, message);
  toastRoot.append(t);
  setTimeout(() => t.remove(), ttl);
}

export function lightbox(src, type = 'image') {
  const backdrop = el('div', { class: 'modal-backdrop', onclick: () => backdrop.remove() });
  const body = el('div', { class: 'modal-body', onclick: (e) => e.stopPropagation() });
  if (type === 'video') {
    body.append(el('video', { src, controls: true, autoplay: true, playsinline: true }));
  } else {
    body.append(el('img', { src, alt: '' }));
  }
  backdrop.append(body);
  document.body.append(backdrop);
  const onKey = (e) => { if (e.key === 'Escape') { backdrop.remove(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
}

export function fmtDate(ts) {
  if (!ts) return '—';
  let d;
  if (ts instanceof Date) d = ts;
  else if (ts && typeof ts.toDate === 'function') d = ts.toDate();
  else if (ts && ts.seconds != null) d = new Date(ts.seconds * 1000);
  else if (typeof ts === 'number') d = new Date(ts);
  else if (typeof ts === 'string') d = new Date(ts);
  else return '—';
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function fmtDateShort(ts) {
  if (!ts) return '—';
  let d;
  if (ts && typeof ts.toDate === 'function') d = ts.toDate();
  else if (typeof ts === 'number') d = new Date(ts);
  else if (typeof ts === 'string') d = new Date(ts);
  else d = ts;
  if (!d || Number.isNaN(d.getTime?.())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function setActiveNav(hash) {
  document.querySelectorAll('.nav a').forEach((a) => {
    const isActive = a.getAttribute('href') === hash
      || (hash.startsWith('#/admin') && a.id === 'navAdmin');
    a.classList.toggle('active', isActive);
  });
}

// ---- Monochrome line icons (replaces emoji throughout the UI)
// Each is a 24x24 stroke-only SVG inheriting currentColor.
const ICONS = {
  ufo: '<path d="M3 14c0-1.5 4-3 9-3s9 1.5 9 3-4 3-9 3-9-1.5-9-3z"/><path d="M7 14c0-3 2-5 5-5s5 2 5 5"/><circle cx="12" cy="8" r="1.6"/><line x1="6" y1="16.5" x2="5" y2="18"/><line x1="18" y1="16.5" x2="19" y2="18"/>',
  book: '<path d="M5 4a2 2 0 0 1 2-2h12v18H7a2 2 0 0 0-2 2V4z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="16" y2="11"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 11 5-3v8l-5-3z"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  map: '<path d="M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><polyline points="9 12 11 14 15 10"/>',
  document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  satellite: '<path d="M5 19 19 5"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="m9 9 6 6"/>',
  ufoBrand: '<ellipse cx="12" cy="14" rx="9" ry="2.6"/><path d="M7 14c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="12" cy="8" r="1.4"/>',
};

export function icon(name, opts = {}) {
  const { size = 22, strokeWidth = 1.5, className = '' } = opts;
  const span = document.createElement('span');
  span.className = `icon ${className}`.trim();
  span.setAttribute('aria-hidden', 'true');
  const path = ICONS[name] || '';
  span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  return span;
}
