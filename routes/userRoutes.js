const express = require('express');

const {
  uploadUserPhoto,
  resizeUserPhoto,
  getAllUsers,
  getUser,
  getMe,
  createNewUser,
  checkWhoDeleteUser,
  checkUpdateMe,
  updateMe,
  deleteUser,
} = require('./../controllers/userController');
const {
  signup,
  activateEmail,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const bookingRouter = require('./bookingRoutes');

const userRouter = express.Router();

userRouter.use('/:userId/bookings', bookingRouter);

userRouter.post('/signup', signup);

userRouter.get('/email-confirm/:email/:token', activateEmail);

userRouter.post('/login', login);
userRouter.get('/logout', logout);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:email/:token', resetPassword);

userRouter.patch('/updatePassword', protect, updatePassword);

userRouter
  .route('/')
  .get(protect, restrictTo('admin'), getAllUsers)
  .post(createNewUser);

userRouter
  .route('/me')
  .get(protect, getMe)
  .patch(protect, uploadUserPhoto, resizeUserPhoto, checkUpdateMe, updateMe);

userRouter
  .route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .delete(protect, restrictTo('admin', 'user'), checkWhoDeleteUser, deleteUser);

module.exports = userRouter;
