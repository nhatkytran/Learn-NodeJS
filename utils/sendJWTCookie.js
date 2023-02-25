const { JWT_COOKIE_EXPIRES_IN } = process.env;

const sendJWTCookie = (cookieName, token, req, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // secure = false for testing purpose with Postman
    // secure: false,
    // maxAge = 5000 --> Cookie gets deleted automatically after time
    // signed = true --> https://stackoverflow.com/questions/11897965/what-are-signed-cookies-in-connect-expressjs

    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // if (NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie(cookieName, token, cookieOptions);
};

module.exports = sendJWTCookie;
