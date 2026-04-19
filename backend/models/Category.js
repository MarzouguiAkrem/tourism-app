const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      fr: { type: String, required: true, trim: true, maxlength: 200 },
      en: { type: String, required: true, trim: true, maxlength: 200 },
      ar: { type: String, required: true, trim: true, maxlength: 200 },
    },
    slug: { type: String, unique: true, lowercase: true, index: true },
    description: {
      fr: { type: String, trim: true, default: '' },
      en: { type: String, trim: true, default: '' },
      ar: { type: String, trim: true, default: '' },
    },
    icon: { type: String, default: 'location' },
    color: { type: String, default: '#0077B6' },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function () {
  if (this.name?.fr && !this.slug) {
    this.slug = slugify(this.name.fr, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Category', categorySchema);
