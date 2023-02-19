const cryptoHash = require('./cryptoHash');

// timeExpires --> minute
const createTokenFactory = (tokenName, timeExpiresName, timeExpires) =>
  async function () {
    const { token, hashedToken } = await cryptoHash();

    this[tokenName] = hashedToken;
    if (timeExpiresName && timeExpires)
      this[timeExpiresName] = Date.now() + timeExpires * 60 * 1000;

    return token;
  };

module.exports = createTokenFactory;
