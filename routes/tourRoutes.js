const express = require('express');

const {
  getTourStats,
  aliasTopTours,
  getMonthlyPlan,
  getAllTours,
  createNewTour,
  getTour,
  updateTour,
  deleteTour,
} = require('./../controllers/tourController');
const { protect } = require('./../controllers/authController');

const tourRouter = express.Router();

// tourRouter.param('id', (_, __, next, value) => {
//   console.log('--- Param middleware:', value);
//   next();
// });

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter.route('/stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.route('/').get(protect, getAllTours).post(createNewTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
