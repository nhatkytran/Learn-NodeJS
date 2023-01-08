const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const verifyJWT = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, JWT_SECRET, (error, token) => {
      if (error) reject(error);
      else resolve(token);
    })
  );

module.exports = verifyJWT;
