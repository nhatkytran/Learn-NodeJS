const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const handlerFactory = require('./handlerFactory');
const { Tour } = require('./../models');
const { AppError, catchAsync } = require('../utils');

const multerStorage = multer.memoryStorage();

const multerFilter = (_, file, cb) =>
  file.mimetype.startsWith('image')
    ? cb(null, true)
    : cb(new AppError('Not an image! Please update only images.', 400), false);

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

const resizeCreatePath = filename =>
  path.join(__dirname, '..', 'public', 'img', 'tours', filename);

exports.resizeTourImages = async (req, _, next) => {
  if (req.files.imageCover) {
    const filename = `tour-${req.params.id}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(resizeCreatePath(filename));

    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, index) => {
        const filename = `tour-${req.params.id}-${index + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(resizeCreatePath(filename));

        req.body.images.push(filename);
      })
    );
  }

  next();
};

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

exports.getToursWithin = catchAsync(async (req, res) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',').map(Number);

  if (!lat || !lng)
    throw new AppError(
      'Please provide latitude and longitude in the right format!',
      400
    );

  const radius = Number(distance) / (unit === 'mi' ? 3963.2 : 6378.1);
  const query = Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  const tours = await query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    tours,
  });
});

exports.getDistances = catchAsync(async (req, res) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',').map(Number);

  if (!lat || !lng)
    throw new AppError(
      'Please provide latitude and longitude in the right format!',
      400
    );

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const query = Tour.aggregate([
    {
      $geoNear: {
        key: 'startLocation',
        near: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  const distances = await query;

  res.status(200).json({
    status: 'success',
    results: distances.length,
    distances,
  });
});

exports.getAllTours = handlerFactory.getAll({
  Model: Tour,
  dataName: 'tours',
});

exports.getTour = handlerFactory.getOne({
  Model: Tour,
  idParam: 'id',
  documentName: 'Tour',
  dataName: 'tour',
  populateOptions: { path: 'reviews' },
});

exports.createNewTour = handlerFactory.createOne({
  Model: Tour,
  dataName: 'tour',
});

exports.updateTour = handlerFactory.updateOne({
  Model: Tour,
  idParam: 'id',
  documentName: 'Tour',
  dataName: 'tour',
});

exports.deleteTour = handlerFactory.deleteOne({
  Model: Tour,
  idParam: 'id',
  documentName: 'Tour',
});
