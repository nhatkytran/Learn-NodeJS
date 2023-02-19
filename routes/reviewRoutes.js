const express = require('express');

const {
  checkGetAllReviews,
  getAllReviews,
  checkNewReview,
  checkTourIsBooked,
  createNewReview,
  checkWhoDeleteReview,
  checkUpdateReview,
  updateReview,
  deleteReview,
} = require('./../controllers/reviewController');
const { protect, restrictTo } = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);

reviewRouter
  .route('/')
  .get(checkGetAllReviews, getAllReviews)
  .post(restrictTo('user'), checkNewReview, checkTourIsBooked, createNewReview);

reviewRouter
  .route('/:reviewId')
  .patch(restrictTo('user'), checkUpdateReview, updateReview)
  .delete(restrictTo('admin', 'user'), checkWhoDeleteReview, deleteReview);

module.exports = reviewRouter;
