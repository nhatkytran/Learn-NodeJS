process.on('uncaughtException', error => {
  console.error('\n--- UNCAUGHT EXCEPTION! Shutting down... ---\n');
  console.error(error);

  process.exit(1);
});

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = require('./app');

const { PORT, DATABASE, DATABASE_NAME, DATABASE_PASSWORD } = process.env;

const DB = DATABASE.replace('<NAME>', DATABASE_NAME).replace(
  '<PASSWORD>',
  DATABASE_PASSWORD
);

let server;

mongoose.set('strictQuery', true);
mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connection - Successful');

    const port = PORT || 3000;
    server = app.listen(port, '127.0.0.1', () => {
      console.log(`App running on port ${port}...`);
    });
  });

process.on('unhandledRejection', error => {
  console.error('\n--- UNHANDLED REJECTION! Shutting down... ---\n');
  console.error(error);

  if (server) server.close(() => process.exit(1));
});
