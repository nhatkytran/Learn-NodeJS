const validator = require('validator');

const { User } = require('./../models');
const {
  AppError,
  catchAsync,
  createSendToken,
  cryptoHash,
  verifyJWT,
  sendEmail,
} = require('./../utils');

exports.signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const query = User.create({
    name,
    email,
    password: String(password),
    passwordConfirm: String(passwordConfirm),
  });
  const user = await query;

  await createSendToken(user._id, 201, res);
});

exports.login = catchAsync(async (req, res) => {
  const email = req.body.email;
  const password = String(req.body.password);

  if (!email || !password)
    throw new AppError('Please provide email and password!', 400);

  const query = User.findOne({ email }).select('+password');
  const user = await query;

  if (!user || !(await user.correctPassword(password)))
    throw new AppError('Incorrect email or password!', 401);

  await createSendToken(user._id, 200, res);
});

exports.protect = catchAsync(async (req, _, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer'))
    throw new AppError('Please login to get access!', 401);

  const token = authorization.split(' ').at(-1);
  const decoded = await verifyJWT(token); // Time out error and invalid error

  const query = User.findById(decoded.id);
  const user = await query;

  if (!user)
    throw new AppError(
      'The user belongs to this token does not longer exist!',
      401
    );

  if (user.changedPassword(decoded.iat))
    throw new AppError(
      'User recently changed password! Please login again.',
      401
    );

  req.user = user;

  next();
});

exports.restrictTo = function (...roles) {
  return (req, _, next) => {
    const user = req.user;

    if (!roles.includes(user.role))
      throw new AppError(
        "You don't have permission to perform this action!",
        403
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new AppError('Please provide an email!', 400);
  if (!validator.isEmail(email))
    throw new AppError('Please provide a valid email!', 400);

  const query = User.findOne({ email });
  const user = await query;

  if (!user) throw new AppError(`User not found with email: ${email}`);

  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateModifiedOnly: true });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetPassword/${email}/${resetToken}`;
  const subject = 'Your password reset token (only valid for 10 mins)';
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({ email, subject, message });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateModifiedOnly: true });

    throw new AppError(
      'Something went wrong sending email! Please try again.',
      500
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Email sent to email',
    // email & resetToken ==> Postman testing,
    email,
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { email, token } = req.params;
  const hashedToken = await cryptoHash(token);

  const query = User.findOne({
    email,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  const user = await query;

  if (!user)
    throw new AppError('Invalid email - token or token has expired!', 401);

  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    throw new AppError('Please provide password and passwordConfirm!', 400);

  // 3. Reset password
  user.password = String(password);
  user.passwordConfirm = String(passwordConfirm);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateModifiedOnly: true });

  await createSendToken(user._id, 200, res);
});

exports.updatePassword = catchAsync(async (req, res) => {
  const query = User.findById(req.user._id).select('+password');
  const user = await query;

  const { oldPassword, password, passwordConfirm } = req.body;

  if (!oldPassword || !password || !passwordConfirm)
    throw new AppError(
      'Please provide oldPassword, password and passwordConfirm',
      400
    );

  if (!(await user.correctPassword(String(oldPassword))))
    throw new AppError('Incorrect oldPassword! Please try again.', 401);

  user.password = String(password);
  user.passwordConfirm = String(passwordConfirm);

  await user.save({ validateModifiedOnly: true });

  await createSendToken(user._id, 200, res);
});
