const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchemaDefinition = require('./tourSchemaDefinition');
// const User = require('../user/userModel');

const tourSchema = new mongoose.Schema(tourSchemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

// --- Indexes ---

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// --- Virtual properties ---

tourSchema.virtual('durationWeek').get(function () {
  if (this.duration) return this.duration / 7;
});

// Virtual populate

tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

// -- Middleware ---

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// tourSchema.pre('save', async function (next) {
//   const ids = this.guides;
//   this.guides = await User.find({ _id: { $in: ids } });

//   next();
// });

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(id => User.findById(id).exec());
//   this.guides = await Promise.all(guidePromises);

//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -password -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (_, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  next();
});

tourSchema.pre('aggregate', function (next) {
  if (!(this._pipeline.length && '$geoNear' in this._pipeline[0]))
    this._pipeline.unshift({
      $match: { secretTour: { $ne: true } },
    });

  next();
});

const tourCollectionName = 'tours';
const Tour = mongoose.model('Tour', tourSchema, tourCollectionName);

module.exports = Tour;
