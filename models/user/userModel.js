const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchemaDefinition = require('./userSchemaDefinition');
const { bcryptHash, bcryptCompare, cryptoHash } = require('./../../utils');

const userSchema = new mongoose.Schema(userSchemaDefinition, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
});

userSchema.pre('save', async function (next) {
  // 'save' works on findByIdAndUpdate --> check if password is updated
  if (this.isModified('password')) {
    this.password = await bcryptHash(this.password, 12);
    this.passwordConfirm = undefined;

    if (!this.isNew) this.passwordChangedAt = Date.now();
  }

  next();
});

userSchema.methods.correctPassword = async function (password) {
  return await bcryptCompare(password, this.password);
};

userSchema.methods.changedPassword = function (tokenTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );

    return tokenTimestamp < passwordChangedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(64).toString('hex');
  const expireTimestamp = Date.now() + 10 * 60 * 1000;

  this.passwordResetToken = await cryptoHash(resetToken);
  this.passwordResetExpires = expireTimestamp;

  return resetToken;
};

const userCollectionName = 'users';
const User = mongoose.model('User', userSchema, userCollectionName);

module.exports = User;
