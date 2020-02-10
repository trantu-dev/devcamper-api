const express = require('express');
const courseController = require('./../controllers/courseController');
const advanceResult = require('./../middlewares/advanceResult');
const Course = require('./../models/Course');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advanceResult(Course, { path: 'bootcamp', select: 'name description' }),
    courseController.getAllCourses
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    courseController.addCourse
  );
router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    courseController.deleteCourse
  );
module.exports = router;
