const express = require('express');

const {
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
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', signup);
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
  .patch(protect, checkUpdateMe, updateMe);

userRouter
  .route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .delete(protect, restrictTo('admin', 'user'), checkWhoDeleteUser, deleteUser);

module.exports = userRouter;
