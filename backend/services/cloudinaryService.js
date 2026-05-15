const cloudinary = require('cloudinary').v2;

let configured = false;

const isConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

const init = () => {
  if (configured) return true;
  if (!isConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return true;
};

/**
 * Upload a local file or a remote URL to Cloudinary.
 * @param {string} source — local path or http(s) URL
 * @param {{folder?: string, publicId?: string, tags?: string[]}} opts
 * @returns {Promise<{url: string, publicId: string}>}
 */
const upload = async (source, opts = {}) => {
  if (!init()) {
    throw new Error('Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET');
  }
  const result = await cloudinary.uploader.upload(source, {
    folder: opts.folder || 'tunisia-tourism',
    public_id: opts.publicId,
    tags: opts.tags,
    overwrite: true,
    resource_type: 'image',
  });
  return { url: result.secure_url, publicId: result.public_id };
};

const uploadBuffer = async (buffer, opts = {}) => {
  if (!init()) {
    throw new Error('Cloudinary is not configured');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder || 'tunisia-tourism',
        public_id: opts.publicId,
        tags: opts.tags,
        overwrite: true,
        resource_type: 'image',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const destroy = async (publicId) => {
  if (!init()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`[cloudinary] destroy(${publicId}) failed:`, err.message);
  }
};

/**
 * Extract a Cloudinary public_id from a secure URL (so callers can delete it
 * later without storing the id separately).
 */
const publicIdFromUrl = (url) => {
  if (typeof url !== 'string') return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
  return match ? match[1] : null;
};

module.exports = {
  isConfigured,
  init,
  upload,
  uploadBuffer,
  destroy,
  publicIdFromUrl,
};
