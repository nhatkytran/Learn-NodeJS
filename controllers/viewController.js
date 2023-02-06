const { Tour, User } = require('./../models');
const { catchAsync, AppError } = require('./../utils');

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
