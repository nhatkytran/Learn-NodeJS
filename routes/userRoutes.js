const express = require('express');

const { getAllUsers, getUser } = require('./../controllers/userController');

const userRouter = express.Router();

userRouter.route('/').get(getAllUsers);
userRouter.route('/:id').get(getUser);

module.exports = userRouter;
