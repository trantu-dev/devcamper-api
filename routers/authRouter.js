const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/me', authController.protect, authController.getMe);
router.post('/forgotpassword', authController.forgotpassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatepassword
);
router.patch(
  '/updateuserdetails',
  authController.protect,
  authController.updateUserDetails
);

module.exports = router;
