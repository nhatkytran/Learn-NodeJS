const handlerFactory = require('./handlerFactory');
const { Review, Tour } = require('./../models');
const { AppError, catchAsync } = require('../utils');

exports.checkGetAllReviews = catchAsync(async (req, _, next) => {
  const { tourId } = req.params;
  const filter = tourId ? { tour: tourId } : {};

  req.filter = filter;

  next();
});

exports.getAllReviews = handlerFactory.getAll({
  Model: Review,
  dataName: 'reviews',
});

exports.checkNewReview = catchAsync(async (req, _, next) => {
  const userId = req.user._id;
  const tourId = req.params.tourId || req.body.tour;

  if (!tourId)
    return next(new AppError('A review must belong to a tour!', 400));

  const tour = await Tour.findById(tourId);

  if (!tour)
    return next(new AppError(`Tour  with ID < ${tourId} > not found!`, 404));

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

  if (!review)
    return next(
      new AppError(`Review with ID < ${reviewId} > doesn't exist!`, 404)
    );

  const reviewUserId = review.user?._id.toString();
  const userId = user._id.toString();

  if (reviewUserId !== userId)
    return next(new AppError('You can only update your own review!', 400));

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
      return next(
        new AppError(`Review with ID < ${reviewId} > doesn't exist!`, 404)
      );

    const reviewUserId = review.user?._id.toString();
    const userId = user._id.toString();

    if (reviewUserId !== userId)
      return next(new AppError('You can only delete your own review!', 400));
  }

  next();
});

exports.deleteReview = handlerFactory.deleteOne({
  Model: Review,
  idParam: 'reviewId',
  documentName: 'Review',
});
