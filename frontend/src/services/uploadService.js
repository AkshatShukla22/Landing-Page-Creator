// src/services/uploadService.js

const CLOUD_NAME  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file) {
  // Catch misconfiguration immediately with a helpful message
  if (!CLOUD_NAME || CLOUD_NAME === 'undefined') {
    throw new Error(
      'VITE_CLOUDINARY_CLOUD_NAME is not set. Add it to your .env file.'
    );
  }
  if (!UPLOAD_PRESET || UPLOAD_PRESET === 'undefined') {
    throw new Error(
      'VITE_CLOUDINARY_UPLOAD_PRESET is not set. Add it to your .env file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return { url: data.secure_url };
}