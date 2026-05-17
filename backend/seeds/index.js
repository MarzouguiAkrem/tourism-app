require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Category = require('../models/Category');
const Place = require('../models/Place');
const CulturalContent = require('../models/CulturalContent');
const EmergencyContact = require('../models/EmergencyContact');
const LivingCost = require('../models/LivingCost');
const SafetyAlert = require('../models/SafetyAlert');
const cloudinary = require('../services/cloudinaryService');

const categoriesData = require('./data/categories');
const placesData = require('./data/places');
const placeImages = require('./data/placeImages');
const culturalData = require('./data/cultural');
const emergencyData = require('./data/emergencyContacts');
const livingCostsData = require('./data/livingCosts');
const safetyAlertsData = require('./data/safetyAlerts');

/**
 * Re-host a Wikimedia/external URL on Cloudinary, deterministic public_id by
 * slug so re-running the seed is idempotent (Cloudinary overwrite=true).
 */
const rehostImage = async (slug, externalUrl) => {
  try {
    const { url } = await cloudinary.upload(externalUrl, {
      folder: 'tunisia-tourism/places',
      publicId: slug,
      tags: ['seed', 'place'],
    });
    return url;
  } catch (err) {
    console.warn(`  ⚠ failed to rehost ${slug}: ${err.message} (keeping original URL)`);
    return externalUrl;
  }
};

const runSeed = async () => {
  try {
    await connectDB();

    const cloudOk = cloudinary.init();
    if (cloudOk) {
      console.log(`→ Cloudinary configured (cloud="${process.env.CLOUDINARY_CLOUD_NAME}") — images will be rehosted`);
    } else {
      console.log('→ Cloudinary not configured — using original URLs (set CLOUDINARY_* in .env to enable rehost)');
    }

    console.log('→ Clearing existing seeded collections...');
    await Promise.all([
      Category.deleteMany({}),
      Place.deleteMany({}),
      CulturalContent.deleteMany({}),
      EmergencyContact.deleteMany({}),
      LivingCost.deleteMany({}),
      SafetyAlert.deleteMany({}),
    ]);

    console.log('→ Seeding categories...');
    const categories = await Category.insertMany(categoriesData);
    const idBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
    console.log(`  ${categories.length} categories inserted`);

    console.log('→ Preparing places (dedupe by slug + attach cover images)...');
    const seenSlugs = new Set();
    const skipped = [];
    const places = [];
    for (const p of placesData) {
      if (seenSlugs.has(p.slug)) {
        skipped.push(p.slug);
        continue;
      }
      seenSlugs.add(p.slug);

      const { categorySlug, ...rest } = p;
      const categoryId = idBySlug[categorySlug];
      if (!categoryId) {
        throw new Error(`Unknown categorySlug "${categorySlug}" on place "${p.slug}"`);
      }

      let coverImage = placeImages[p.slug] || rest.coverImage || null;
      if (cloudOk && coverImage && !coverImage.includes('cloudinary.com')) {
        process.stdout.write(`  ↑ rehosting ${p.slug}...`);
        coverImage = await rehostImage(p.slug, coverImage);
        process.stdout.write(' ✓\n');
      }
      places.push({ ...rest, category: categoryId, coverImage });
    }
    if (skipped.length) {
      console.log(`  skipped ${skipped.length} duplicate slug(s): ${skipped.join(', ')}`);
    }
    const placesInserted = await Place.insertMany(places);
    const withImage = placesInserted.filter((p) => p.coverImage).length;
    console.log(`  ${placesInserted.length} places inserted (${withImage} with cover image)`);

    console.log('→ Seeding cultural content...');
    const cultural = await CulturalContent.insertMany(culturalData);
    console.log(`  ${cultural.length} cultural items inserted`);

    console.log('→ Seeding emergency contacts...');
    const emergency = await EmergencyContact.insertMany(emergencyData);
    console.log(`  ${emergency.length} emergency contacts inserted`);

    console.log('→ Seeding living costs...');
    const livingCosts = await LivingCost.insertMany(livingCostsData);
    console.log(`  ${livingCosts.length} living-cost items inserted`);

    console.log('→ Seeding safety alerts...');
    const alerts = await SafetyAlert.insertMany(safetyAlertsData);
    console.log(`  ${alerts.length} safety alerts inserted`);

    await mongoose.connection.close();
    console.log('\n✓ Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Seed failed:', err.message);
    if (err.errors) {
      Object.values(err.errors).forEach((e) => console.error('  -', e.message));
    }
    process.exit(1);
  }
};

runSeed();
