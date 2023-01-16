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

exports.checkUpdateUserName = catchAsync(async (req, _, next) => {
  const updateUserId = req.params.id;
  const userId = req.user._id.toString();

  if (updateUserId !== userId)
    return next(new AppError('You can only update your own name!', 400));

  if (Object.keys(req.body).length > 1)
    return next(
      new AppError(`Route ${req.originalUrl} only updates user's name!`, 400)
    );

  const { name } = req.body;

  if (!name) return next(new AppError('Please provide field < name >!', 400));

  req.body = { name };

  next();
});

exports.updateUserName = handlerFactory.updateOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
  dataName: 'user',
});

exports.createNewUser = catchAsync(async (_, res) => {
  res.status(501).json({
    status: 'fail',
    message: 'Please use /signup instead!',
  });
});

exports.checkWhoDeleteUser = catchAsync(async (req, _, next) => {
  const { user } = req;
  const { role } = user;

  if (role === 'user') {
    const { id } = req.params;
    const userId = user._id.toString();

    if (id !== userId)
      return next(new AppError('You can only delete your own account!', 400));
  }

  next();
});

exports.deleteUser = handlerFactory.deleteOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
});
