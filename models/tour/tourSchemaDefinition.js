const mongoose = require('mongoose');

const { requiredMessage } = require('../../utils');

const tourSchemaDefinition = {
  name: {
    type: String,
    required: [true, requiredMessage('name')],
    unique: true,
    trim: true,
    minlength: [
      10,
      "A tour's name must have more than or equal to 10 characters!",
    ],
    maxlength: [
      40,
      "A tour's name must have less than or equal to 40 characters!",
    ],
    validate: {
      validator: value => !!/^[a-zA-Z\s]*$/.exec(value),
      message: "A tour's name only contains letter and space!",
    },
  },
  duration: {
    type: Number,
    required: [true, requiredMessage('duration')],
  },
  maxGroupSize: {
    type: Number,
    required: [true, requiredMessage('maxGroupSize')],
  },
  difficulty: {
    type: String,
    required: [true, requiredMessage('difficulty')],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be either: easy, medium, difficult',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'A ratingsAverage must be more than or equal to 1.0'],
    max: [5, 'A ratingsAverage must be less than or equal to 5.0'],
    set: value => Math.round(value * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, requiredMessage('price')],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (value) {
        return value < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price!',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, requiredMessage('summary')],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, requiredMessage('imageCover')],
  },
  images: { type: [String] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startDates: { type: [Date] },
  slug: { type: String },
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: { type: [Number] },
    address: { type: String },
    description: { type: String },
  },
  locations: [
    {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number] },
      address: { type: String },
      description: { type: String },
      day: { type: Number },
    },
  ],
  // guides: { type: Array }, // => Embedding
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
};

module.exports = tourSchemaDefinition;
