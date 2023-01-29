const bcrypt = require('bcryptjs');

const bcryptCompare = (loginPassword, dbPassword) =>
  new Promise((resolve, reject) =>
    bcrypt.compare(loginPassword, dbPassword, (error, result) =>
      error ? reject(error) : resolve(result)
    )
  );

module.exports = bcryptCompare;
