// eBook page — cover + blurb + "Purchase via WhatsApp" button.
// Tapping the button opens wa.me with a prefilled message containing the book name.

import { el, toast } from './ui.js';
import { getEbookConfig } from './firebase.js';
import { config } from './config.js';

export async function renderEbook() {
  const view = document.getElementById('view');
  view.innerHTML = '';

  view.append(el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'eBook'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Dashboard'),
  ]));

  const ebook = (await getEbookConfig()) || {
    title: 'eBook coming soon',
    blurb: 'Details will appear here once the admin publishes them.',
    price: '',
    coverImageUrl: '',
  };

  const wrap = el('div', { class: 'panel ebook-wrap' });

  const cover = el('div', { class: 'ebook-cover' });
  if (ebook.coverImageUrl) {
    cover.append(el('img', { src: ebook.coverImageUrl, alt: ebook.title }));
  } else {
    cover.style.display = 'flex';
    cover.style.alignItems = 'center';
    cover.style.justifyContent = 'center';
    cover.style.fontSize = '64px';
    cover.append(document.createTextNode('📖'));
  }
  wrap.append(cover);

  const info = el('div', { class: 'ebook-info' });
  info.append(el('h2', {}, ebook.title));
  if (ebook.price) info.append(el('div', { class: 'price' }, ebook.price));
  info.append(el('p', { class: 'muted' }, ebook.blurb));

  const adminPhone = config.adminWhatsapp;
  const message = `Hi! I'd like to purchase your eBook: "${ebook.title}". Please send me the payment + delivery details.`;
  const link = adminPhone
    ? `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`
    : '#';

  const purchaseBtn = el('a', {
    class: 'btn btn-primary',
    href: link,
    target: '_blank',
    rel: 'noopener noreferrer',
    style: 'margin-top:14px',
    onclick: (e) => {
      if (!adminPhone) {
        e.preventDefault();
        toast('Admin WhatsApp not configured yet — set VITE_ADMIN_WHATSAPP in .env', 'error');
      }
    },
  }, ['💬 Purchase via WhatsApp']);
  info.append(purchaseBtn);

  info.append(el('p', { class: 'dim', style: 'font-size:12px;margin-top:14px' },
    'You\'ll be sent to WhatsApp with a prefilled message containing the book name. The researcher will reply with payment and delivery details.'));

  wrap.append(info);
  view.append(wrap);
}
