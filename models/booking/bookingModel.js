const mongoose = require('mongoose');

const bookingSchemaDefinition = require('./bookingSchemaDefinition');

const bookingSchema = new mongoose.Schema(bookingSchemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const bookingCollecitonName = 'bookings';
const Booking = mongoose.model('Booking', bookingSchema, bookingCollecitonName);

module.exports = Booking;
