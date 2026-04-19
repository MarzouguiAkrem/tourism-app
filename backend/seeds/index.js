require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Place = require('../models/Place');
const categoriesData = require('./data/categories');
const placesData = require('./data/places');

const runSeed = async () => {
  try {
    await connectDB();

    console.log('→ Clearing existing categories and places...');
    await Category.deleteMany({});
    await Place.deleteMany({});

    console.log('→ Seeding categories...');
    const categories = await Category.insertMany(categoriesData);
    const idBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
    console.log(`  ${categories.length} categories inserted`);

    console.log('→ Seeding places...');
    const places = placesData.map((p) => {
      const { categorySlug, ...rest } = p;
      const categoryId = idBySlug[categorySlug];
      if (!categoryId) {
        throw new Error(`Unknown categorySlug "${categorySlug}" on place "${p.slug}"`);
      }
      return { ...rest, category: categoryId };
    });

    const inserted = await Place.insertMany(places);
    console.log(`  ${inserted.length} places inserted`);

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
