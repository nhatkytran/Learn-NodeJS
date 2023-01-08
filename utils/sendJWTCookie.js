const { NODE_ENV, JWT_COOKIE_EXPIRES_IN } = process.env;

const sendJWTCookie = (cookieName, token, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure = false for testing purpose with Postman
    secure: false,
  };

  if (NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie(cookieName, token, cookieOptions);
};

module.exports = sendJWTCookie;
