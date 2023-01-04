const { AppError } = require('./../utils');

const { NODE_ENV } = process.env;

const sendErrorDev = (errorObject, res) => {
  const { error, statusCode, status, message, stack } = errorObject;

  res.status(statusCode).json({ status, message, error, stack });
};

const sendErrorProd = (errorObject, res) => {
  const { isOperational } = errorObject;

  if (isOperational) {
    const { statusCode, status, message } = errorObject;

    res.status(statusCode).json({ status, message });
  } else {
    console.error(errorObject.error);

    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

const handleCastErrorDB = error =>
  new AppError(`Invalid ${error.path}: ${error.value}`, 400);

const handleValidationErrorDB = error => new AppError(error.message, 400);

const handleDuplicateError = error => {
  const [key, value] = Object.entries(error.keyValue)[0];

  return new AppError(
    `Duplicate field < ${key} >: < ${value} >. Please use another value!`,
    400
  );
};

const globalErrorHandler = (error, _, res, __) => {
  let newError = NODE_ENV === 'development' ? error : Object.create(error);

  if (NODE_ENV === 'production') {
    // CastError --> Invalid id
    if (newError.name === 'CastError') newError = handleCastErrorDB(newError);

    // ValidationError
    if (newError.name === 'ValidationError')
      newError = handleValidationErrorDB(newError);

    // Duplicate Error
    if (newError.code === 11000) newError = handleDuplicateError(newError);
  }

  const statusCode = newError.statusCode || 500;
  const status = newError.status || 'error';
  const message = newError.message || 'Something went wrong!';
  const { stack, isOperational } = newError;

  const errorObject = { error: newError, statusCode, status, message };

  if (NODE_ENV === 'development') sendErrorDev({ ...errorObject, stack }, res);

  if (NODE_ENV === 'production')
    sendErrorProd({ ...errorObject, isOperational }, res);
};

module.exports = globalErrorHandler;
