const mongoose = require('mongoose');

const Tour = require('./../tour/tourModel');
const { AppError } = require('./../../utils');
const bookingSchemaDefinition = require('./bookingSchemaDefinition');

const bookingSchema = new mongoose.Schema(bookingSchemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

bookingSchema.pre('save', async function (next) {
  const startDateTime = this.startDate.getTime();
  const tour = await Tour.findById(this.tour);

  const startDateIndex = tour.startDates.findIndex(
    item => new Date(item.startDate).getTime() === startDateTime
  );

  const newParticipants = tour.startDates[startDateIndex].participants + 1;

  if (newParticipants > this.maxGroupSize)
    throw new AppError(
      "Participants of this tour's date is full! Please choose another date!",
      400
    );

  tour.startDates[startDateIndex].participants += 1;
  await tour.save({ validateModifiedOnly: true });

  next();
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
