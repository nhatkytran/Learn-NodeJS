const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const verifyJWT = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET, (error, token) =>
      error ? reject(error) : resolve(token)
    )
  );

module.exports = verifyJWT;
