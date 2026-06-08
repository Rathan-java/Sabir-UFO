// Profile view — shows user's Google photo, name (editable), email.

import { el, $, toast } from './ui.js';
import { getSession, updateMyName, signOutCurrent } from './auth.js';
import { navigate } from './router.js';

export function renderProfile() {
  const view = document.getElementById('view');
  view.innerHTML = '';
  const s = getSession();
  if (!s.user) { navigate('#/'); return; }

  const card = el('div', { class: 'panel', style: 'max-width:520px;margin:40px auto;' });
  card.append(el('h2', {}, 'Your Profile'));

  const head = el('div', { class: 'profile-row', style: 'margin-bottom:24px;' });
  head.append(el('img', {
    class: 'avatar avatar-lg',
    src: s.profile?.photoURL || s.user.photoURL || fallbackAvatar(s.profile?.displayName),
    alt: '',
  }));
  const headInfo = el('div');
  headInfo.append(el('div', { class: 'profile-name', style: 'font-size:18px' }, s.profile?.displayName || ''));
  headInfo.append(el('div', { class: 'profile-email' }, s.profile?.email || s.user.email || ''));
  if (s.profile?.role === 'admin') {
    headInfo.append(el('span', { class: 'badge class', style: 'margin-top:6px;display:inline-block' }, 'ADMIN'));
  }
  head.append(headInfo);
  card.append(head);

  const form = el('form', { class: 'form', onsubmit: async (e) => {
    e.preventDefault();
    const v = $('#displayName', card).value.trim();
    if (!v) { toast('Name cannot be empty', 'error'); return; }
    if (v.length > 80) { toast('Name too long', 'error'); return; }
    const btn = $('#saveBtn', card);
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await updateMyName(v);
    } catch (err) {
      toast(err.message || 'Failed', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Save changes';
    }
  } });

  const field = el('div', { class: 'field' });
  field.append(el('label', { for: 'displayName' }, 'Display name'));
  field.append(el('input', {
    id: 'displayName', type: 'text', value: s.profile?.displayName || '', maxlength: 80,
  }));
  field.append(el('div', { class: 'hint' }, 'Shown publicly on the map only if you allow it per report.'));
  form.append(field);

  const emailField = el('div', { class: 'field' });
  emailField.append(el('label', {}, 'Google email'));
  emailField.append(el('input', {
    type: 'email', value: s.profile?.email || s.user.email || '', disabled: true,
  }));
  emailField.append(el('div', { class: 'hint' }, 'Linked to your Google account — not editable.'));
  form.append(emailField);

  const row = el('div', { class: 'row between', style: 'margin-top:8px' });
  row.append(el('button', { id: 'saveBtn', class: 'btn btn-primary', type: 'submit' }, 'Save changes'));
  row.append(el('button', { class: 'btn btn-ghost', type: 'button', onclick: async () => {
    await signOutCurrent();
    navigate('#/');
  } }, 'Sign out'));
  form.append(row);

  card.append(form);
  view.append(card);
}

export function fallbackAvatar(name) {
  const seed = encodeURIComponent((name || 'U').slice(0, 2).toUpperCase());
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=7a5cff`;
}
