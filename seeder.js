const fs = require('fs');
const mongoose = require('mongoose');
require('colors');
const dotenv = require('dotenv');

dotenv.config();
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

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

const allBootcamps = JSON.parse(
  fs.readFileSync('./_data/bootcamps.json', 'utf-8')
);
const allCourses = JSON.parse(fs.readFileSync('./_data/courses.json', 'utf-8'));
const allUsers = JSON.parse(fs.readFileSync('./_data/users.json', 'utf-8'));
const allReviews = JSON.parse(fs.readFileSync('./_data/reviews.json', 'utf-8'));

const importData = async () => {
  try {
    await Bootcamp.create(allBootcamps);
    await Course.create(allCourses);
    await User.create(allUsers);
    await Review.create(allReviews);
    console.log('Data imported successfully'.green.inverse);
  } catch (error) {
    console.log('Data imported fail: ', error.message);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully'.red.inverse);
  } catch (error) {
    console.log('Data deleted fail: ', error.message);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
