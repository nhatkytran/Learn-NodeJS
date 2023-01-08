const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRES_IN: expiresIn } = process.env;

const signJWT = id =>
  new Promise((resolve, reject) =>
    jwt.sign({ id }, JWT_SECRET, { expiresIn }, (error, token) => {
      if (error) reject(error);
      else resolve(token);
    })
  );

module.exports = signJWT;
