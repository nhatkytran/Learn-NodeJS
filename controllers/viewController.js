const { Tour, Booking } = require('./../models');
const { catchAsync, AppError } = require('./../utils');

exports.alerts = (req, res, next) => {
  if (req.query.alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";

  next();
};

exports.getOverview = catchAsync(async (_, res) => {
  const query = Tour.find();
  const tours = await query;

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const query = Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  const tour = await query;

  if (!tour) throw new AppError('Tour not found!', 404);

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (_, res) =>
  res.status(200).render('login', {
    title: 'Log into your account',
  })
);

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
});

exports.getMyTours = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });

  const tourIDs = bookings.map(booking => booking.tour._id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
    user: req.user,
  });
});
