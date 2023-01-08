const express = require('express');

const {
  getAllUsers,
  getUser,
  deleteUser,
} = require('./../controllers/userController');
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:email/:token', resetPassword);

userRouter.patch('/updatePassword', protect, updatePassword);

userRouter.route('/').get(getAllUsers);
userRouter
  .route('/:id')
  .get(getUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = userRouter;
