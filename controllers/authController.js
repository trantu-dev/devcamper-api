const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('./../middlewares/asyncHandler');
const email = require('./../utils/email');
const AppError = require('./../utils/AppError');
const User = require('./../models/User');

const signJWT = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const sendJWTResponse = (user, res) => {
  const token = signJWT(user._id);
  const option = {
    maxAge: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }
  res
    .status(200)
    .cookie('jwt', token, option)
    .json({
      status: 'success',
      token
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Enter email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password)))
    return next(new AppError('Invalid email or password', 401));

  sendJWTResponse(user, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendJWTResponse(user, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.jwt) {
    token = req.headers.jwt;
  }

  if (!token) return next(new AppError('Please login', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  req.user = user;
  next();
});

// @desc    Get current login user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc    Log user out / Clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = catchAsync(async (req, res, next) => {
  res
    .cookie('jwt', 'none', { maxAge: 10 * 1000, httpOnly: true })
    .status(200)
    .json({
      status: 'success'
    });
});

// @desc    Update password
// @route   PATCH /api/v1/auth/updatepassword
// @access  Private
exports.updatepassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.password)))
    return next(new AppError('Password is not correct', 401));

  user.password = req.body.newPassword;
  await user.save();

  sendJWTResponse(user, res);
});

// @desc    Update user details
// @route   PATCH /api/v1/auth/updateuserdetails
// @access  Private
exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name
  };
  const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: user
  });
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(
      new AppError('You have no permission to access this route', 403)
    );
  next();
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotpassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('There is no user with that email', 404));

  const resetToken = await user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const msg = `You are receiving this email because you (or someone else) has requested the request of password. Please make a PATCH request to \n\n${resetURL} `;

  try {
    await email({
      email: user.email,
      subject: 'Password reset token',
      message: msg
    });
  } catch (error) {
    console.log('ERROR'.bgRed, error.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }

  res.status(200).json({
    status: 'success',
    data: resetToken
  });
});

// @desc    Reset password
// @route   PATCH /api/v1/auth/resetpassword/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gte: Date.now() }
  });

  if (!user)
    return next(new AppError('Invalid token or user has removed', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendJWTResponse(user, res);
});
