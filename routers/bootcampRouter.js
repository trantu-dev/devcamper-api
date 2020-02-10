const express = require('express');
const bootcampControllers = require('./../controllers/bootcampController');
const courseRouter = require('./courseRouter');
const reviewRouter = require('./reviewRouter');
const advanceResult = require('./../middlewares/advanceResult');
const Bootcamp = require('./../models/Bootcamp');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use('/:bootcampID/courses', courseRouter);
router.use('/:bootcampID/reviews', reviewRouter);

router
  .route('/')
  .get(advanceResult(Bootcamp, 'courses'), bootcampControllers.getAllBootcamps)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampControllers.createBootcamp
  );

router
  .route('/:id')
  .get(bootcampControllers.getBootcamp)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampControllers.updateBootcamp
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'publisher'),
    bootcampControllers.deleteBootcamp
  );

router.patch(
  '/:id/photo',
  authController.protect,
  authController.restrictTo('admin', 'publisher'),
  bootcampControllers.bootcampPhotoUpload
);

router.get(
  '/center/:zipcode/distance/:distance',
  bootcampControllers.getBootcampsInRadius
);

module.exports = router;
