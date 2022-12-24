const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const { NODE_ENV } = process.env;

// Middleware

if (NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((_, __, next) => {
//   console.log(`Request's timestamp: ${Date.now()}`);
//   next();
// });

// Route

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
