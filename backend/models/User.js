const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, LANGUAGES, INTERESTS, BUDGET_LEVELS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.TOURIST,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    nationality: {
      type: String,
      default: null,
    },
    preferences: {
      languages: {
        type: [String],
        enum: LANGUAGES,
        default: ['fr', 'en'],
      },
      interests: {
        type: [String],
        enum: INTERESTS,
        default: [],
      },
      budgetLevel: {
        type: String,
        enum: BUDGET_LEVELS,
        default: 'moderate',
      },
      currency: {
        type: String,
        default: 'EUR',
      },
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    pushTokens: {
      type: [
        {
          token: { type: String, required: true },
          platform: { type: String, enum: ['ios', 'android', 'web'], default: 'android' },
          createdAt: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      default: [],
    },
    notificationPreferences: {
      safetyAlerts: { type: Boolean, default: true },
      itineraryReminders: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    lastKnownLocation: {
      type: { type: String, enum: ['Point'], default: null },
      coordinates: { type: [Number], default: undefined },
      updatedAt: { type: Date, default: null },
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (Mongoose 9: async hooks don't use next())
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
