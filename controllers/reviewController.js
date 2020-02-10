const Review = require('./../models/Review');
const Bootcamp = require('./../models/Bootcamp');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../middlewares/asyncHandler');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampID/reviews
// @access  Public
exports.getAllReviews = catchAsync(async (req, res, next) => {
  res.status(200).json(res.advanceResult);
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });
  if (!review) return next(new AppError('No review found with this id', 404));

  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc    Add review
// @route   POST /api/v1/bootcamp/:bootcampID/reviews
// @access  Private
exports.addReview = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampID;
  req.body.user = req.user._id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampID);
  if (!bootcamp) return next(new AppError('No bootcamp with this id', 404));
  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: review
  });
});

// @desc    Update review
// @route   PATCH /api/v1/reviews/:id
// @access  Private
exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('No review with this id', 404));

  if (
    req.user.role === 'admin' ||
    review.user.toString() === req.user._id.toString()
  ) {
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  } else {
    return next(
      new AppError('You have no permission to update this review', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new AppError('No review with this id', 404));

  if (
    req.user.role === 'admin' ||
    review.user.toString() === req.user._id.toString()
  ) {
    await Review.findByIdAndDelete(req.params.id);
  } else {
    return next(
      new AppError('You have no permission to update this review', 403)
    );
  }

  res.status(204).json({
    status: 'success'
  });
});
