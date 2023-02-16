const validator = require('validator');

const { User } = require('./../models');
const {
  AppError,
  catchAsync,
  createSendToken,
  cryptoHash,
  Email,
  verifyJWT,
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

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

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

exports.logout = catchAsync(async (_, res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, _, next) => {
  const { authorization } = req.headers;

  let token;
  if (authorization && authorization.startsWith('Bearer'))
    token = authorization.split(' ').at(-1);
  else token = req.cookies.jwt;

  if (!token) throw new AppError('Please login to get access!', 401);

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

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  const cookie = req.cookies.jwt;

  if (authorization || cookie) {
    let token;
    if (authorization && authorization.startsWith('Bearer'))
      token = authorization.split(' ').at(-1);
    else token = cookie;

    let decoded;
    try {
      decoded = await verifyJWT(token); // Time out error and invalid error
    } catch (_) {
      return next();
    }

    const query = User.findById(decoded.id);
    const user = await query;

    if (!user) return next();
    if (user.changedPassword(decoded.iat)) return next();

    res.locals.user = user;
  }

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

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/resetPassword/${email}/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
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

  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm)
    throw new AppError(
      'Please provide currentPassword, password and passwordConfirm',
      400
    );

  if (!(await user.correctPassword(String(currentPassword))))
    throw new AppError('Incorrect currentPassword! Please try again.', 401);

  user.password = String(password);
  user.passwordConfirm = String(passwordConfirm);

  await user.save({ validateModifiedOnly: true });

  await createSendToken(user._id, 200, res);
});
