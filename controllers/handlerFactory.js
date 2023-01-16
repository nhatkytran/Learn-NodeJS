const { AppError, APIFeatures, catchAsync } = require('./../utils');

exports.getAll = ({ Model, dataName }) =>
  catchAsync(async (req, res) => {
    console.log(req.query);

    const features = await APIFeatures(Model, req.query, req.filter || {});

    features.filter().sort().project().paginate();

    const documents = await features.query.explain();

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: { [dataName]: documents },
    });
  });

exports.getOne = ({
  Model,
  idParam,
  documentName,
  dataName,
  populateOptions,
}) =>
  catchAsync(async (req, res, next) => {
    const id = req.params[idParam];
    const query = Model.findById(id).populate(populateOptions).explain();
    const document = await query;

    if (!document)
      return next(
        new AppError(`${documentName} not found with ID: ${id}`, 404)
      );

    res.status(200).json({ status: 'success', data: { [dataName]: document } });
  });

exports.createOne = ({ Model, dataName }) =>
  catchAsync(async (req, res) => {
    const query = Model.create(req.body);
    const newTour = await query;

    res.status(201).json({ status: 'success', data: { [dataName]: newTour } });
  });

exports.updateOne = ({ Model, idParam, documentName, dataName }) =>
  catchAsync(async (req, res, next) => {
    const id = req.params[idParam];
    const query = Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    const document = await query;

    if (!document)
      return next(
        new AppError(`${documentName} not found with ID: ${id}`, 404)
      );

    res.status(200).json({ status: 'success', data: { [dataName]: document } });
  });

exports.deleteOne = ({ Model, idParam, documentName }) =>
  catchAsync(async (req, res, next) => {
    const id = req.params[idParam];
    const query = Model.findByIdAndDelete(id);
    const document = await query;

    if (!document)
      return next(
        new AppError(`${documentName} not found with ID: ${tourId}`, 404)
      );

    res.status(204).json({ status: 'success', data: null });
  });
