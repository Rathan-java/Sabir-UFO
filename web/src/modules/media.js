// Single upload abstraction so we can swap providers in one place.
// Default: Cloudinary unsigned upload (free).
// Optional: Firebase Storage (requires Blaze plan).
//
// In demo mode (no provider configured), files are turned into local data URLs
// so the UI still works — these are NOT persisted to a real bucket.

import { config } from './config.js';

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB safety guard

function detectType(file) {
  if (file.type?.startsWith('video/')) return 'video';
  if (file.type?.startsWith('image/')) return 'image';
  // fall back by extension
  const ext = (file.name || '').split('.').pop()?.toLowerCase();
  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return 'video';
  return 'image';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function uploadToCloudinary(file) {
  const cloudName = config.media.cloudinary.cloudName;
  const preset = config.media.cloudinary.uploadPreset;
  if (!cloudName || !preset || cloudName.startsWith('your-')) {
    // not configured → fall back to data URL so demo still works
    return { url: await fileToDataUrl(file), type: detectType(file), local: true };
  }
  const isVideo = detectType(file) === 'video';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? 'video' : 'image'}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return { url: data.secure_url, type: isVideo ? 'video' : 'image' };
}

// Firebase Storage variant — lazy-loaded so demo bundles stay smaller.
async function uploadToFirebaseStorage(file) {
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const storage = getStorage();
  const path = `sightings/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return { url, type: detectType(file) };
}

export async function uploadMedia(file) {
  if (!file) throw new Error('No file provided');
  if (file.size > MAX_BYTES) throw new Error('File too large (max 30 MB)');
  if (config.media.provider === 'firebase') return uploadToFirebaseStorage(file);
  return uploadToCloudinary(file);
}

export async function uploadAllMedia(files, onProgress) {
  const out = [];
  let done = 0;
  for (const f of files) {
    try {
      const result = await uploadMedia(f);
      out.push(result);
    } catch (err) {
      console.error('Upload failed for', f.name, err);
      throw err;
    } finally {
      done++;
      onProgress?.(done, files.length);
    }
  }
  return out;
}
