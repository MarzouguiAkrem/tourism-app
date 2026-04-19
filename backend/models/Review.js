const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    comment: { type: String, trim: true, maxlength: 2000, required: true },
    photos: { type: [String], default: [] },
    visitDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // auto-approve in MVP; admin can reject later
      index: true,
    },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per place (prevents spam / duplicates)
reviewSchema.index({ user: 1, place: 1 }, { unique: true });

// Recalculate the parent place's rating when a review is created/updated/deleted
reviewSchema.statics.recalcPlaceRating = async function (placeId) {
  const Place = mongoose.model('Place');
  const stats = await this.aggregate([
    { $match: { place: new mongoose.Types.ObjectId(placeId), status: 'approved' } },
    {
      $group: {
        _id: '$place',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const update = stats.length
    ? { 'rating.average': Math.round(stats[0].average * 10) / 10, 'rating.count': stats[0].count }
    : { 'rating.average': 0, 'rating.count': 0 };

  await Place.findByIdAndUpdate(placeId, update);
};

reviewSchema.post('save', async function () {
  await this.constructor.recalcPlaceRating(this.place);
});

// Use a pre-hook on findOneAndDelete/Update to keep the doc reference
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await mongoose.model('Review').recalcPlaceRating(doc.place);
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await mongoose.model('Review').recalcPlaceRating(doc.place);
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.recalcPlaceRating(this.place);
});

module.exports = mongoose.model('Review', reviewSchema);
