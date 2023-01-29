const handlerFactory = require('./handlerFactory');
const { Review, Tour } = require('./../models');
const { AppError, catchAsync } = require('../utils');

exports.checkGetAllReviews = catchAsync(async (req, _, next) => {
  const { tourId } = req.params;
  req.filterOptions = tourId ? { tour: tourId } : {};

  next();
});

exports.getAllReviews = handlerFactory.getAll({
  Model: Review,
  dataName: 'reviews',
});

exports.checkNewReview = catchAsync(async (req, _, next) => {
  const userId = req.user._id;
  const tourId = req.params.tourId || req.body.tour;

  if (!tourId) throw new AppError('A review must belong to a tour!', 400);

  const tour = await Tour.findById(tourId);
  if (!tour) throw new AppError(`Tour not found with ID: ${tourId}!`, 404);

  const { review, rating } = req.body;
  req.body = { review, rating, tour: tourId, user: userId };

  next();
});

exports.createNewReview = handlerFactory.createOne({
  Model: Review,
  dataName: 'review',
});

exports.checkUpdateReview = catchAsync(async (req, _, next) => {
  const user = req.user;
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) throw new AppError(`Review not found with ID ${reviewId}!`, 404);

  if (String(review.user?._id) !== String(user._id))
    throw new AppError('You can only update your own review!', 400);

  if (!req.body.hasOwnProperty('review') && !req.body.hasOwnProperty('rating'))
    throw new AppError(
      'This route can only update < review > and < rating >!',
      400
    );

  req.body = Object.entries(req.body).reduce((acc, [field, value]) => {
    if (field === 'review' || field === 'rating') acc[field] = value;

    return acc;
  }, {});

  next();
});

exports.updateReview = handlerFactory.updateOne({
  Model: Review,
  idParam: 'reviewId',
  documentName: 'Review',
  dataName: 'review',
});

exports.checkWhoDeleteReview = catchAsync(async (req, _, next) => {
  const { user } = req;
  const { role } = user;

  if (role === 'user') {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review)
      throw new AppError(`Review not found with ID: ${reviewId}!`, 404);
    if (String(review.user?._id) !== String(user._id))
      throw new AppError('You can only delete your own review!', 400);
  }

  next();
});

exports.deleteReview = handlerFactory.deleteOne({
  Model: Review,
  idParam: 'reviewId',
  documentName: 'Review',
});
