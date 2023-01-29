const crypto = require('crypto');

const cryptoHash = token =>
  Promise.resolve(crypto.createHash('sha256').update(token).digest('hex'));

module.exports = cryptoHash;
