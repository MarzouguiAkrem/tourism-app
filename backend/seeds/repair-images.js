/**
 * Repair script — re-uploads place cover images to Cloudinary without
 * touching any other data. Idempotent: places already on Cloudinary are
 * skipped.
 *
 * Run with:  node seeds/repair-images.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Place = require('../models/Place');
const cloudinary = require('../services/cloudinaryService');
const placeImages = require('./data/placeImages');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia rate-limits Cloudinary's fetcher with 429s when uploads come too
// fast. Retry with exponential backoff on 429.
const rehost = async (slug, externalUrl, attempt = 1) => {
  try {
    const { url } = await cloudinary.upload(externalUrl, {
      folder: 'tunisia-tourism/places',
      publicId: slug,
      tags: ['repair', 'place'],
    });
    return url;
  } catch (err) {
    if (/429/.test(err.message) && attempt < 4) {
      const wait = 5000 * attempt; // 5s, 10s, 15s
      process.stdout.write(` ⏳ 429, retry in ${wait / 1000}s...`);
      await sleep(wait);
      return rehost(slug, externalUrl, attempt + 1);
    }
    throw err;
  }
};

(async () => {
  await connectDB();
  if (!cloudinary.init()) {
    console.error('✗ Cloudinary not configured — set CLOUDINARY_* in .env');
    process.exit(1);
  }
  console.log(`→ Cloudinary OK (cloud="${process.env.CLOUDINARY_CLOUD_NAME}")`);

  const places = await Place.find({}, 'slug name.fr coverImage').lean();
  const toFix = places.filter(
    (p) => !p.coverImage || !p.coverImage.includes('cloudinary.com')
  );

  console.log(`→ ${places.length} places total, ${toFix.length} to repair`);
  if (toFix.length === 0) {
    console.log('✓ Nothing to do');
    await mongoose.disconnect();
    process.exit(0);
  }

  let ok = 0;
  const failed = [];
  for (const p of toFix) {
    const source = placeImages[p.slug] || p.coverImage;
    if (!source) {
      console.log(`  ⏭  ${p.slug} — no source URL in placeImages.js, skipping`);
      failed.push({ slug: p.slug, reason: 'no source' });
      continue;
    }
    process.stdout.write(`  ↑ ${p.slug}...`);
    try {
      const url = await rehost(p.slug, source);
      await Place.updateOne({ _id: p._id }, { $set: { coverImage: url } });
      ok++;
      process.stdout.write(' ✓\n');
    } catch (err) {
      process.stdout.write(` ✗ ${err.message}\n`);
      failed.push({ slug: p.slug, reason: err.message });
    }
    // Throttle to stay below Wikimedia's per-IP rate limit.
    await sleep(2000);
  }

  console.log(`\n✓ Repaired ${ok}/${toFix.length}`);
  if (failed.length) {
    console.log('✗ Failed:');
    failed.forEach((f) => console.log(`  • ${f.slug} — ${f.reason}`));
  }

  await mongoose.disconnect();
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('✗', e.message);
  process.exit(1);
});
