const express = require('express');
const reviewController = require('./../controllers/reviewController');
const advanceResult = require('./../middlewares/advanceResult');
const Review = require('./../models/Review');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advanceResult(Review, { path: 'bootcamp', select: 'name description' }),
    reviewController.getAllReviews
  )
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.addReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
