const bcrypt = require('bcryptjs');

const bcryptCompare = (loginPassword, dbPassword) =>
  new Promise((resolve, reject) =>
    bcrypt.compare(loginPassword, dbPassword, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    })
  );

module.exports = bcryptCompare;
