const catchAsync = require('./catchAsync');
const signJWT = require('./signJWT');
const sendJWTCookie = require('./sendJWTCookie');

const createSendToken = catchAsync(async (id, statusCode, res) => {
  const token = await signJWT(id);

  sendJWTCookie('jwt', token, res);
  res.status(statusCode).json({ status: 'success', token });
});

module.exports = createSendToken;
