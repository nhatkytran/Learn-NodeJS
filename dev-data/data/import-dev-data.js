const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { Tour } = require('./../../models');

dotenv.config({ path: path.join(__dirname, '..', '..', 'config.env') });

const { DATABASE, DATABASE_NAME, DATABASE_PASSWORD } = process.env;

const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tours-simple.json'), 'utf-8')
);

const DB = DATABASE.replace('<NAME>', DATABASE_NAME).replace(
  '<PASSWORD>',
  DATABASE_PASSWORD
);

const importData = async () => {
  try {
    const query = Tour.create(tours);
    await query;

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
    const query = Tour.deleteMany();
    await query;

    console.log('Data delete - Successful!');
  } catch (error) {
    console.error('Data delete - Failed!');
    console.error(error);
  } finally {
    process.exit();
  }
};

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
