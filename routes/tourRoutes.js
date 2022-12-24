const express = require('express');

const {
  getAllTours,
  createNewTour,
  getTour,
} = require('./../controllers/tourController');

const tourRouter = express.Router();

// tourRouter.param('id', (_, __, next, value) => {
//   console.log('--- Param middleware:', value);
//   next();
// });

tourRouter.route('/').get(getAllTours).post(createNewTour);
tourRouter.route('/:id').get(getTour);

module.exports = tourRouter;
