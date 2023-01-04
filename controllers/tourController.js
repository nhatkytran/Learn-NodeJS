const { Tour } = require('./../models');
const { APIFeatures, catchAsync, AppError } = require('../utils');

exports.aliasTopTours = (req, _, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,duration,difficulty';

  next();
};

exports.getTourStats = catchAsync(async (_, res) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { numTours: 1, avgPrice: 1 } },
    // { $match: { _id: { $ne: 'EASY' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = Number(req.params.year);

  if (!Number.isInteger(year)) throw new Error('Year must be an integer!');

  const tours = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $sort: { month: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getAllTours = catchAsync(async (req, res) => {
  console.log(req.query);

  const features = await APIFeatures(Tour, req.query);

  features.filter().sort().project().paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const query = Tour.findById(tourId);
  const tour = await query;

  if (!tour)
    return next(new AppError(`Tour not found with ID: ${tourId}`, 404));

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createNewTour = catchAsync(async (req, res) => {
  const query = Tour.create(req.body);
  const newTour = await query;

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const query = Tour.findByIdAndUpdate(tourId, req.body, {
    new: true,
    runValidators: true,
  });
  const tour = await query;

  if (!tour)
    return next(new AppError(`Tour not found with ID: ${tourId}`, 404));

  res.status(200).json({
    status: 'success',
    data: { tour: tour },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const query = Tour.findByIdAndDelete(tourId);
  const tour = await query;

  if (!tour)
    return next(new AppError(`Tour not found with ID: ${tourId}`, 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
