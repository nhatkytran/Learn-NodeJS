const express = require('express');

const {
  uploadTourImages,
  resizeTourImages,
  getTourStats,
  aliasTopTours,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  getAllTours,
  createNewTour,
  getTour,
  updateTour,
  deleteTour,
} = require('./../controllers/tourController');
const { protect, restrictTo } = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

// tourRouter.param('id', (_, __, next, value) => {
//   console.log('--- Param middleware:', value);
//   next();
// });

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/stats').get(protect, restrictTo('admin'), getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin'), getMonthlyPlan);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin'), createNewTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin'), deleteTour);

module.exports = tourRouter;
