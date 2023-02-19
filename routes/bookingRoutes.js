const express = require('express');

const { protect, restrictTo } = require('./../controllers/authController');
const {
  getCheckoutSession,
  checkNewBooking,
  createNewBooking,
  getBooking,
  checkGetAllBookings,
  getAllBookings,
  checkUpdateBooking,
  updateBooking,
  deleteBooking,
} = require('./../controllers/bookingController');

const bookingRouter = express.Router({ mergeParams: true });

bookingRouter.use(protect);

bookingRouter.get('/checkout-session/:tourId', getCheckoutSession);

bookingRouter.use(restrictTo('admin'));

bookingRouter
  .route('/')
  .get(checkGetAllBookings, getAllBookings)
  .post(checkNewBooking, createNewBooking);

bookingRouter
  .route('/:id')
  .patch(checkUpdateBooking, updateBooking)
  .get(getBooking)
  .delete(deleteBooking);

module.exports = bookingRouter;
