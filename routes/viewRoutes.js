const express = require('express');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserName,
} = require('./../controllers/viewController');
const { protect, isLoggedIn } = require('./../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/me', protect, getAccount);

viewRouter.use(isLoggedIn);

viewRouter.route('/').get(getOverview);
viewRouter.route('/tours/:slug').get(getTour);
viewRouter.route('/login').get(getLoginForm);

module.exports = viewRouter;
