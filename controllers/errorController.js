const { AppError } = require('./../utils');

const { NODE_ENV } = process.env;

const sendErrorDevAPI = (errorObject, res) => {
  const { error, statusCode, status, message, stack } = errorObject;

  res.status(statusCode).json({ status, message, error, stack });
};

const sendErrorDevRender = ({ statusCode, errorMessage }, res) =>
  res.status(statusCode).render('error', {
    title: 'Something went wrong!',
    errorMessage,
  });

const sendErrorProdAPI = (errorObject, res) => {
  const { isOperational } = errorObject;

  if (isOperational) {
    const { statusCode, status, message } = errorObject;

    res.status(statusCode).json({ status, message });
  } else {
    console.error(errorObject.error);

    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

const sendErrorProdRender = (
  { isOperational, statusCode, errorMessage },
  res
) => {
  const title = 'Something went wrong';

  res.status(isOperational ? statusCode : 500).render('error', {
    title,
    errorMessage: isOperational ? errorMessage : title,
  });
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

const handleJWTError = () =>
  new AppError('Invalid token! Please login again.', 401);

const handleTokenExpiredError = () =>
  new AppError('Token has expired! Please login again.', 401);

const globalErrorHandler = (error, req, res, _) => {
  let newError = NODE_ENV === 'development' ? error : Object.create(error);

  if (NODE_ENV === 'production') {
    // CastError --> Invalid id
    if (newError.name === 'CastError') newError = handleCastErrorDB(newError);

    // ValidationError
    if (newError.name === 'ValidationError')
      newError = handleValidationErrorDB(newError);

    // Duplicate Error
    if (newError.code === 11000) newError = handleDuplicateError(newError);

    // Invalid JWT Error
    if (newError.name === 'JsonWebTokenError') newError = handleJWTError();

    // Token Expired Error
    if (newError.name === 'TokenExpiredError')
      newError = handleTokenExpiredError();
  }

  const statusCode = newError.statusCode || 500;
  const status = newError.status || 'error';
  const message = newError.message || 'Something went wrong!';
  const { stack, isOperational } = newError;

  const errorObject = { error: newError, statusCode, status, message };

  if (NODE_ENV === 'development')
    if (req.originalUrl.startsWith('/api'))
      sendErrorDevAPI({ ...errorObject, stack }, res);
    else sendErrorDevRender({ statusCode, errorMessage: message }, res);

  if (NODE_ENV === 'production')
    if (req.originalUrl.startsWith('/api'))
      sendErrorProdAPI({ ...errorObject, isOperational }, res);
    else
      sendErrorProdRender(
        { isOperational, statusCode, errorMessage: message },
        res
      );
};

module.exports = globalErrorHandler;
