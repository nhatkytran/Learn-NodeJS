const validator = require('validator');

const userSchemaDefinition = {
  name: {
    type: String,
    required: [true, 'Please provide a name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  activeEmail: {
    type: Boolean,
    default: false,
  },
  activeEmailToken: {
    type: String,
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'Password confirm - Failed!',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
};

module.exports = userSchemaDefinition;
