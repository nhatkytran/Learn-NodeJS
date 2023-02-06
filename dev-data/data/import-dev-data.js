const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { Tour, User, Review } = require('./../../models');

dotenv.config({ path: path.join(__dirname, '..', '..', 'config.env') });

const { DATABASE, DATABASE_NAME, DATABASE_PASSWORD } = process.env;

const getData = fileName =>
  JSON.parse(fs.readFileSync(path.join(__dirname, fileName), 'utf-8'));

const tours = getData('tours.json');
const users = getData('users.json');
const reviews = getData('reviews.json');

const importData = async () => {
  try {
    await Promise.all([
      Tour.create(tours, { validateBeforeSave: false }),
      User.create(users, { validateBeforeSave: false }),
      Review.create(reviews, { validateBeforeSave: false }),
    ]);

    console.log('Data import - Successful!');
  } catch (error) {
    console.error('Data import - Failed!');
    console.error(error);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Promise.all([
      Tour.deleteMany().exec(),
      User.deleteMany().exec(),
      Review.deleteMany().exec(),
    ]);

    console.log('Data delete - Successful!');
  } catch (error) {
    console.error('Data delete - Failed!');
    console.error(error);
  } finally {
    process.exit();
  }
};

const DB = DATABASE.replace('<NAME>', DATABASE_NAME).replace(
  '<PASSWORD>',
  DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connection - Successful!');

    const action = process.argv.at(-1);

    switch (action) {
      case '--import':
        importData();
        break;
      case '--delete':
        deleteData();
        break;
      default:
        console.error('Action (--import | --delete) missing!');
        process.exit();
    }
  })
  .catch(error => {
    console.error('Database connection - Failed!');
    console.error(error);
  });
