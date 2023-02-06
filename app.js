const express = require('express');
const morgan = require('morgan');
const path = require('path');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorController');
const { AppError } = require('./utils');

const {
  viewRouter,
  tourRouter,
  userRouter,
  reviewRouter,
} = require('./routes');

const { NODE_ENV } = process.env;

const app = express();

// Template Engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Static file
app.use(express.static(path.join(__dirname, 'public')));

// Middleware

app.use(helmet());

if (NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Custom middleware

// app.use((_, __, next) => {
//   console.log(`Request's timestamp: ${Date.now()}`);
//   next();
// });

// Security

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP! Please try again in an hour.',
});

app.use('/api', limiter);

// Route

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Unhandled routes

app.all('*', (req, _, next) =>
  next(new AppError(`${req.originalUrl} not found!`, 404))
);

// Global Error Handling Middleware

app.use(globalErrorHandler);

module.exports = app;
