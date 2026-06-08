// "Report a UFO Sighting" form.
// Full Hynek/Vallée dropdown, multi-file media upload, location auto-capture,
// witness count, shape, duration, public toggle.

import { el, $, $$, toast } from './ui.js';
import { getSession } from './auth.js';
import { createSighting } from './firebase.js';
import { uploadAllMedia } from './media.js';
import { HYNEK_CLASSIFICATIONS, OBJECT_SHAPES } from './config.js';
import { navigate } from './router.js';

export function renderReport() {
  const view = document.getElementById('view');
  view.innerHTML = '';
  const s = getSession();
  if (!s.user) { navigate('#/'); return; }

  view.append(el('div', { class: 'row between', style: 'margin-bottom:18px' }, [
    el('h2', { style: 'margin:0' }, 'Report a UFO Sighting'),
    el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, '← Back'),
  ]));

  const panel = el('div', { class: 'panel' });
  const form = el('form', { class: 'form', novalidate: true });

  // Classification + shape
  form.append(twoCol(
    field('classification', 'Classification', selectInput('classification', HYNEK_CLASSIFICATIONS, '', true)),
    field('objectShape', 'Object shape', selectInput('objectShape', OBJECT_SHAPES, 'Light')),
  ));

  // Sighted at + duration
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  form.append(twoCol(
    field('sightedAt', 'Date & time of sighting',
      el('input', { id: 'sightedAt', type: 'datetime-local', max: localNow, value: localNow, required: true })),
    field('durationText', 'Duration',
      el('input', { id: 'durationText', type: 'text', placeholder: 'e.g. ~3 minutes', maxlength: 60 })),
  ));

  // Witnesses + place
  form.append(twoCol(
    field('witnessCount', 'Number of witnesses',
      el('input', { id: 'witnessCount', type: 'number', min: 1, max: 9999, value: 1 })),
    field('place', 'City / region',
      el('input', { id: 'place', type: 'text', placeholder: 'e.g. Phoenix, AZ', maxlength: 120 })),
  ));

  // Location row (lat/lng + capture button)
  const locField = el('div', { class: 'field' });
  locField.append(el('label', {}, 'Coordinates (optional)'));
  const locRow = el('div', { class: 'row gap-sm' });
  locRow.append(el('input', { id: 'lat', type: 'number', step: 'any', placeholder: 'Latitude', style: 'flex:1' }));
  locRow.append(el('input', { id: 'lng', type: 'number', step: 'any', placeholder: 'Longitude', style: 'flex:1' }));
  locRow.append(el('button', { class: 'btn btn-ghost', type: 'button', onclick: captureLocation }, '📍 Use my location'));
  locField.append(locRow);
  locField.append(el('div', { class: 'hint' }, 'Used to pin your report on the public map (only if you allow it below).'));
  form.append(locField);

  // Description
  form.append(field('description', 'Describe what you saw',
    el('textarea', {
      id: 'description', required: true, maxlength: 5000,
      placeholder: 'Be specific: shape, color, motion, sound (or lack of), how it ended…',
    }), true));

  // Media uploader
  const mediaField = el('div', { class: 'field' });
  mediaField.append(el('label', {}, 'Photos & videos (optional, up to 10)'));
  const dz = el('label', { class: 'uploader', for: 'mediaInput' }, [
    el('span', { class: 'big' }, '⬆'),
    el('div', {}, 'Click or drop files here'),
    el('div', { class: 'small' }, 'Images & videos · max 30 MB each'),
    el('input', { id: 'mediaInput', type: 'file', multiple: true, accept: 'image/*,video/*' }),
  ]);
  mediaField.append(dz);
  const thumbs = el('div', { class: 'media-thumbs' });
  mediaField.append(thumbs);
  form.append(mediaField);

  // Public toggle
  const pubRow = el('div', { class: 'checkbox-row' }, [
    el('input', { id: 'isPublic', type: 'checkbox' }),
    el('div', {}, [
      el('label', { for: 'isPublic' }, 'Show this report publicly on the sightings map with my name'),
      el('div', { class: 'hint' }, 'Off by default. When off, your report is admin-only.'),
    ]),
  ]);
  form.append(pubRow);

  // Submit row
  const submitRow = el('div', { class: 'row between', style: 'margin-top:8px' });
  submitRow.append(el('button', { class: 'btn btn-primary', id: 'submitBtn', type: 'submit' }, 'Submit sighting'));
  submitRow.append(el('a', { class: 'btn btn-ghost', href: '#/dashboard' }, 'Cancel'));
  form.append(submitRow);

  panel.append(form);
  view.append(panel);

  // ---- behaviors ----
  const selectedFiles = [];
  const fileInput = $('#mediaInput', form);

  fileInput.addEventListener('change', (e) => addFiles(e.target.files));
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => {
    e.preventDefault(); dz.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => {
    e.preventDefault(); dz.classList.remove('dragover');
  }));
  dz.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

  function addFiles(list) {
    const incoming = Array.from(list || []);
    for (const f of incoming) {
      if (selectedFiles.length >= 10) { toast('Max 10 files', 'error'); break; }
      selectedFiles.push(f);
      const url = URL.createObjectURL(f);
      const isVideo = f.type.startsWith('video/');
      const thumb = el('div', { class: 'media-thumb' });
      thumb.append(isVideo
        ? el('video', { src: url, muted: true })
        : el('img', { src: url, alt: f.name }));
      thumb.append(el('button', {
        class: 'remove', type: 'button', 'aria-label': 'Remove',
        onclick: () => {
          const i = selectedFiles.indexOf(f);
          if (i >= 0) selectedFiles.splice(i, 1);
          thumb.remove();
        },
      }, '×'));
      thumbs.append(thumb);
    }
    // reset input so re-adding same file works
    fileInput.value = '';
  }

  function captureLocation() {
    if (!navigator.geolocation) { toast('Geolocation not supported', 'error'); return; }
    toast('Requesting location…', 'info', 2000);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        $('#lat', form).value = p.coords.latitude.toFixed(6);
        $('#lng', form).value = p.coords.longitude.toFixed(6);
        toast('Location captured', 'success');
      },
      (err) => toast(err.message || 'Could not get location', 'error'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = $('#description', form).value.trim();
    const classification = $('#classification', form).value;
    if (!description) { toast('Description is required', 'error'); return; }
    if (!classification) { toast('Pick a classification', 'error'); return; }

    const btn = $('#submitBtn', form);
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="margin-right:8px"></span> Uploading…';

    try {
      const media = selectedFiles.length
        ? await uploadAllMedia(selectedFiles, (done, total) => {
            btn.innerHTML = `<span class="spinner" style="margin-right:8px"></span> Uploading ${done}/${total}…`;
          })
        : [];

      const lat = parseFloat($('#lat', form).value);
      const lng = parseFloat($('#lng', form).value);
      const place = $('#place', form).value.trim();

      const sightedAtVal = $('#sightedAt', form).value;
      const sightedAtMs = sightedAtVal ? new Date(sightedAtVal).getTime() : Date.now();

      await createSighting({
        reporterUid: s.user.uid,
        reporterName: s.profile?.displayName || s.user.displayName || 'Anonymous',
        reporterEmail: s.profile?.email || s.user.email || '',
        isPublic: $('#isPublic', form).checked,
        classification,
        objectShape: $('#objectShape', form).value,
        witnessCount: Math.max(1, parseInt($('#witnessCount', form).value, 10) || 1),
        sightedAt: sightedAtMs,
        durationText: $('#durationText', form).value.trim(),
        location: {
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null,
          place,
        },
        description,
        media,
        status: 'pending',
        adminNotes: '',
      });

      toast('Sighting submitted — thank you.', 'success');
      navigate('#/reports');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Submission failed', 'error');
      btn.disabled = false;
      btn.textContent = 'Submit sighting';
    }
  });
}

// ---- helpers ----
function field(id, label, control, required = false) {
  const wrap = el('div', { class: 'field' });
  const lab = el('label', { for: id }, label);
  if (required) lab.append(el('span', { class: 'req' }, '*'));
  wrap.append(lab);
  wrap.append(control);
  return wrap;
}

function twoCol(a, b) {
  const row = el('div', { class: 'form-row' });
  row.append(a); row.append(b);
  return row;
}

function selectInput(id, options, defaultVal = '', required = false) {
  const sel = el('select', { id, required });
  if (!defaultVal) sel.append(el('option', { value: '' }, '— Select —'));
  for (const o of options) {
    const opt = el('option', { value: o }, o);
    if (o === defaultVal) opt.setAttribute('selected', '');
    sel.append(opt);
  }
  return sel;
}
