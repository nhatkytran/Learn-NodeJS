const mongoose = require('mongoose');

const { Tour } = require('./../../models');
const reviewSchemaDefinition = require('./reviewSchemaDefinition');

const reviewSchema = new mongoose.Schema(reviewSchemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

// --- Indexes ---

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// --- Static methods ---

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0]?.nRating || 0,
    ratingsAverage: stats[0]?.avgRating || 4.5,
  });
};

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name -guides',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(
  /^findOneAnd/,
  async doc => await doc.constructor.calcAverageRatings(doc.tour)
);

const reviewCollectionName = 'reviews';
const Review = mongoose.model('Review', reviewSchema, reviewCollectionName);

module.exports = Review;
