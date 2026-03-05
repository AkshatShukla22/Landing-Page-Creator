// frontend/src/services/uploadService.js
// Uploads image directly to Cloudinary from browser - no backend involved

export const uploadToCloudinary = async (base64File) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', base64File);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'metabull/logos');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload failed');
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
};
