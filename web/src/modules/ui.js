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
