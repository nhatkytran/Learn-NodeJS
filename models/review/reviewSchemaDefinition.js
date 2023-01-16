const mongoose = require('mongoose');

const reviewSchemaDefinition = {
  review: {
    type: String,
    required: [true, 'Review can not be empty!'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Review must have a rating!'],
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A review must belong to a tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to an user!'],
  },
};

module.exports = reviewSchemaDefinition;
