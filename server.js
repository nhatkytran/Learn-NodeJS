const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = require('./app');

const { PORT } = process.env;

const port = PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  console.log(`App running on port ${port}...`);
});
