const { Tour } = require('./../models');
const { APIFeatures } = require('../utils');

exports.aliasTopTours = (req, _, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,duration,difficulty';

  next();
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};

exports.getAllTours = async (req, res) => {
  console.log(req.query);

  try {
    const features = await APIFeatures(Tour, req.query);

    features.filter().sort().project().paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const query = Tour.findById(req.params.id);
    const tour = await query;

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};

exports.createNewTour = async (req, res) => {
  try {
    const query = Tour.create(req.body);
    const newTour = await query;

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const query = Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    const tour = await query;

    res.status(200).json({
      status: 'success',
      data: { tour: tour },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Something went wrong!',
      error,
    });
  }
};
