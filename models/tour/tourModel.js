const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchemaDefinition = require('./tourSchemaDefinition');

const tourSchema = new mongoose.Schema(tourSchemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

// --- Virtual properties ---

tourSchema.virtual('durationWeek').get(function () {
  if (this.duration) return this.duration / 7;
});

// -- Middleware ---

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// tourSchema.post('save', function (docs, next) {
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.post(/^find/, function (_, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  next();
});

tourSchema.pre('aggregate', function (next) {
  this._pipeline.unshift({
    $match: { secretTour: { $ne: true } },
  });

  next();
});

const tourCollectionName = 'tours';
const Tour = mongoose.model('Tour', tourSchema, tourCollectionName);

module.exports = Tour;
