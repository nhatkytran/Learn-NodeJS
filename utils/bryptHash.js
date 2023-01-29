const bcrypt = require('bcryptjs');

const bcryptHash = (password, cost) =>
  new Promise((resolve, reject) =>
    bcrypt.hash(password, cost, (error, hashPassword) =>
      error ? reject(error) : resolve(hashPassword)
    )
  );

module.exports = bcryptHash;
