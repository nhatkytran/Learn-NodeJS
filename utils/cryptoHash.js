const crypto = require('crypto');

const cryptoHash = defaultToken => {
  const token = defaultToken || crypto.randomBytes(64).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return Promise.resolve({ token, hashedToken });
};

module.exports = cryptoHash;
