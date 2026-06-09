// UFO Interviews page — list of YouTube interviews from Firestore.
// Cards use YouTube auto-thumbnails. Click opens youtube.com in a new tab.

import { el, fmtDateShort } from './ui.js';
import { listInterviews } from './firebase.js';

export async function renderInterviews() {
  const view = document.getElementById('view');
  view.innerHTML = '';

  view.append(el('div', { class: 'row between', style: 'margin-bottom:8px' }, [
    el('h2', { style: 'margin:0' }, 'Interviews by Sabir Hussain'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Dashboard'),
  ]));
  view.append(el('p', { class: 'muted', style: 'margin-top:0' },
    'Field interviews and recorded talks by Mr. Sabir Hussain, Founder of INSUFOS. Tap any card to watch on YouTube.'));

  const items = await listInterviews();

  if (!items.length) {
    view.append(el('div', { class: 'empty-state' }, [
      el('span', { class: 'big' }, '🎥'),
      el('div', {}, 'No interviews published yet. Check back soon.'),
    ]));
    return;
  }

  const grid = el('div', { class: 'video-grid' });
  for (const iv of items) {
    const id = iv.youtubeId;
    const thumb = `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
    const fallback = `https://img.youtube.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;
    const card = el('a', {
      class: 'video-card',
      href: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
      target: '_blank',
      rel: 'noopener noreferrer',
    }, [
      el('div', { class: 'thumb' }, el('img', {
        src: thumb, alt: iv.title,
        onerror: function () { this.onerror = null; this.src = fallback; },
        loading: 'lazy',
      })),
      el('div', { class: 'info' }, [
        el('h4', {}, iv.title || 'Untitled'),
        el('div', { class: 'date' }, fmtDateShort(iv.publishedAt)),
      ]),
    ]);
    grid.append(card);
  }
  view.append(grid);
}
