const { User } = require('./../models');
const { catchAsync, AppError } = require('./../utils');

exports.getAllUsers = catchAsync(async (_, res) => {
  const query = User.find();
  const users = await query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const query = User.findById(id);
  const user = await query;

  if (!user) return next(new AppError(`User not found with ID: ${id}`));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const query = User.findByIdAndDelete(id);
  const user = await query;

  if (!user) return next(new AppError(`User not found with ID: ${id}`));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
