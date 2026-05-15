#!/usr/bin/env node
// Usage:
//   node scripts/createAdmin.js <email> <password> [firstName] [lastName]
// If the user already exists, only its role is upgraded to "admin".

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const [, , email, password, firstName = 'Admin', lastName = 'User'] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/createAdmin.js <email> <password> [firstName] [lastName]');
  process.exit(1);
}

if (password.length < 8) {
  console.error('✗ Password must be at least 8 characters');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    const normalized = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalized });

    if (user) {
      if (user.role === 'admin') {
        console.log(`ℹ ${normalized} is already an admin — no change`);
      } else {
        user.role = 'admin';
        await user.save();
        console.log(`✓ Promoted ${normalized} to admin`);
      }
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: normalized,
        password,        // pre-save hook hashes via bcrypt
        role: 'admin',
        isActive: true,
      });
      console.log(`✓ Created admin user ${normalized} (${user._id})`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('✗ Failed:', err.message);
    if (err.errors) Object.values(err.errors).forEach((e) => console.error('  -', e.message));
    process.exit(1);
  }
})();
