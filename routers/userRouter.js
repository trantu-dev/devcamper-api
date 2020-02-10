const express = require('express');
const userController = require('./../controllers/userController');
const advanceResult = require('./../middlewares/advanceResult');
const User = require('./../models/User');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(advanceResult(User), userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
