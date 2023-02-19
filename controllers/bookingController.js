const Stripe = require('stripe');

const handlerFactory = require('./handlerFactory');
const { Booking, Tour, User } = require('./../models');
const { AppError, catchAsync } = require('./../utils');

const { STRIPE_SECRET_KEY } = process.env;

exports.getCheckoutSession = catchAsync(async (req, res) => {
  console.log('-->', req.params);
  const { tourId } = req.params;

  const query = Tour.findById(tourId);
  const tour = await query;

  if (!tour) throw new AppError(`Tour not found with ID < ${tourId} >`, 404);

  const stripe = Stripe(STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${
      req.user._id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  const query = Booking.create({ tour, user, price });
  await query;

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.checkNewBooking = catchAsync(async (req, _, next) => {
  const { tourId, userId } = req.params;
  let { tour, user, startDate } = req.body;

  tour = tourId || tour;
  user = userId || user;

  if (!tour || !user || !startDate)
    throw new AppError(
      'Please privide all fields needed (tour, user, startDate)',
      400
    );

  if (
    !startDate.match(
      /^([0-9]{4})-((01|02|03|04|05|06|07|08|09|10|11|12|(?:J(anuary|u(ne|ly))|February|Ma(rch|y)|A(pril|ugust)|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)|(September|October|November|December)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)))|(january|february|march|april|may|june|july|august|september|october|november|december))-([0-3][0-9])\s([0-1][0-9]|[2][0-3]):([0-5][0-9]):([0-5][0-9])$/
    )
  )
    throw new AppError(
      'startDate format < YYYY-MM-DD HH:MM:SS > required!',
      400
    );

  const currentTour = await Tour.findById(tour);
  const currentUser = await User.findById(user);

  if (!currentTour)
    throw new AppError(`Tour not found with ID < ${tour} >`, 404);
  if (!currentUser)
    throw new AppError(`User not found with ID < ${user} >`, 404);

  const newStartDateTime = new Date(startDate).getTime();
  const hasDate = currentTour.startDates.some(
    item => new Date(item.startDate).getTime() === newStartDateTime
  );
  if (!hasDate) throw new AppError('startDate value not found!', 404);

  req.body = {
    tour,
    user,
    price: currentTour.price,
    startDate: newStartDateTime,
  };

  next();
});

exports.createNewBooking = handlerFactory.createOne({
  Model: Booking,
  dataName: 'booking',
});

exports.getBooking = handlerFactory.getOne({
  Model: Booking,
  idParam: 'id',
  documentName: 'Booking',
  dataName: 'booking',
  populateOptions: 'tour user',
});

exports.checkGetAllBookings = async (req, _, next) => {
  const { tourId, userId } = req.params;

  req.filterOptions = {};
  if (tourId) req.filterOptions = { tour: tourId };
  if (userId) req.filterOptions = { user: userId };

  next();
};

exports.getAllBookings = handlerFactory.getAll({
  Model: Booking,
  dataName: 'bookings',
});

exports.checkUpdateBooking = catchAsync(async (req, _, next) => {
  const keys = Object.keys(req.body);
  if (keys.length !== 1 || !keys.includes('paid'))
    throw new AppError('This route is only used to update < paid >', 400);

  next();
});

exports.updateBooking = handlerFactory.updateOne({
  Model: Booking,
  idParam: 'id',
  documentName: 'Booking',
  dataName: 'booking',
});

exports.deleteBooking = handlerFactory.deleteOne({
  Model: Booking,
  idParam: 'id',
  documentName: 'Booking',
});
