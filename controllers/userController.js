const handlerFactory = require('./handlerFactory');
const { User } = require('./../models');
const { catchAsync, AppError } = require('./../utils');

exports.getAllUsers = handlerFactory.getAll({
  Model: User,
  dataName: 'users',
});

exports.getUser = handlerFactory.getOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
  dataName: 'user',
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      me: req.user,
    },
  });
});

exports.createNewUser = catchAsync(async (_, res) =>
  res.status(501).json({
    status: 'fail',
    message: 'Please use /signup instead!',
  })
);

exports.checkUpdateMe = catchAsync(async (req, _, next) => {
  if (Object.keys(req.body).length > 1 || !req.body.name)
    throw new AppError(
      `Route ${req.originalUrl} only used for updating user's name!`,
      400
    );

  req.params.id = req.user._id;

  next();
});

exports.updateMe = handlerFactory.updateOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
  dataName: 'user',
});

exports.checkWhoDeleteUser = catchAsync(async (req, _, next) => {
  const { user } = req;
  const { role } = user;

  if (role === 'user' && req.params.id !== String(user._id))
    throw new AppError('You can only delete your own account!', 400);

  next();
});

exports.deleteUser = handlerFactory.deleteOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
});
