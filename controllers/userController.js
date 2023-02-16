const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

const { User } = require('./../models');
const handlerFactory = require('./handlerFactory');
const { AppError, catchAsync } = require('./../utils');

// const multerStorage = multer.diskStorage({
//   // cb --> next
//   destination: (_, __, cb) => {
//     cb(null, path.join(__dirname, '..', 'public', 'img', 'users'));
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/').at(-1);
//     cb(null, `user-${req.user_id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (_, file, cb) =>
  file.mimetype.startsWith('image')
    ? cb(null, true)
    : cb(new AppError('Not an image! Please update only images.', 400), false);

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, _, next) => {
  if (req.file) {
    const fileName = `user-${req.user._id}-${Date.now()}.jpeg`;
    const filePath = path.join(
      __dirname,
      '..',
      'public',
      'img',
      'users',
      fileName
    );

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(filePath);

    req.file.filename = fileName;
  }

  next();
});

exports.getAllUsers = handlerFactory.getAll({
  Model: User,
  dataName: 'users',
});

exports.getUser = handlerFactory.getOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
  dataName: 'user',
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      me: req.user,
    },
  });
});

exports.createNewUser = catchAsync(async (_, res) =>
  res.status(501).json({
    status: 'fail',
    message: 'Please use /signup instead!',
  })
);

exports.checkUpdateMe = catchAsync(async (req, _, next) => {
  const updateFields = Object.keys(req.body);

  // req.body does not read multi-part form data
  const isUnexpectedFields = updateFields.length > 1;
  const isNotName = updateFields.length === 1 && !updateFields.includes('name');
  const isNotPhoto = updateFields.length === 0 && !req.file;

  if (isUnexpectedFields || isNotName || isNotPhoto)
    throw new AppError(
      `Route ${req.originalUrl} only used for updating user's name and photo!`,
      400
    );

  if (req.file) req.body.photo = req.file.filename;
  req.params.id = req.user._id;

  next();
});

exports.updateMe = handlerFactory.updateOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
  dataName: 'user',
});

exports.checkWhoDeleteUser = catchAsync(async (req, _, next) => {
  const { user } = req;
  const { role } = user;

  if (role === 'user' && req.params.id !== String(user._id))
    throw new AppError('You can only delete your own account!', 400);

  next();
});

exports.deleteUser = handlerFactory.deleteOne({
  Model: User,
  idParam: 'id',
  documentName: 'User',
});
