const signJWT = require('./signJWT');
const sendJWTCookie = require('./sendJWTCookie');

const createSendToken = async (id, statusCode, req, res) => {
  const token = await signJWT(id);

  sendJWTCookie('jwt', token, req, res);
  res.status(statusCode).json({ status: 'success', token });
};

module.exports = createSendToken;
