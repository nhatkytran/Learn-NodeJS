const express = require('express');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
} = require('./../controllers/viewController');
const { protect, isLoggedIn } = require('./../controllers/authController');
const { createBookingCheckout } = require('./../controllers/bookingController');

const viewRouter = express.Router();

viewRouter.get('/me', protect, getAccount);
viewRouter.get('/my-tours', protect, getMyTours);

viewRouter.route('/').get(createBookingCheckout, isLoggedIn, getOverview);

viewRouter.use(isLoggedIn);

viewRouter.route('/tours/:slug').get(getTour);
viewRouter.route('/login').get(getLoginForm);

module.exports = viewRouter;
