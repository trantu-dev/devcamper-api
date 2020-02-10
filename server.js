const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
require('colors');
const app = require('./app');
// CONNECT DB
const connectString = process.env.MONGO_ATLAS.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);
mongoose
  .connect(connectString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connect successfully!'.yellow.bold);
  });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`.yellow.bold);
});

// HANDLE PROMISE REJECTION
process.on('unhandledRejection', err => {
  console.log(`🔥🔥🔥 ERR: ${err.message}`.red.bold);
  server.close(() => {
    process.exit(1);
  });
});
