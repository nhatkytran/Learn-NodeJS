const bcrypt = require('bcryptjs');

const bcryptHash = (password, cost) =>
  new Promise((resolve, reject) =>
    bcrypt.hash(password, cost, (error, hashPassword) => {
      if (error) reject(error);
      else resolve(hashPassword);
    })
  );

module.exports = bcryptHash;
