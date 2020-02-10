const Course = require('./../models/Course');
const Bootcamp = require('./../models/Bootcamp');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../middlewares/asyncHandler');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampID/courses
// @access  Public
exports.getAllCourses = catchAsync(async (req, res, next) => {
  res.status(200).json(res.advanceResult);
});

// @desc    Get single courses
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course)
    return next(new AppError(`No course with this id: ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc    Add courses
// @route   POST /api/v1/bootcamps/:bootcampID/courses
// @access  Private
exports.addCourse = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampID);
  if (!bootcamp)
    return next(
      new AppError(`No bootcamp with id: ${req.params.bootcampID}`, 400)
    );
  if (
    bootcamp.user._id.toString() != req.user._id.toString() &&
    req.user.role !== 'admin'
  )
    return next(
      new AppError(
        'You are not bootcamp owner, you have no permission to add course to this bootcamp',
        403
      )
    );
  req.body.bootcamp = req.params.bootcampID;
  req.body.user = req.user._id;

  const course = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: course
  });
});

// @desc    Update courses
// @route   PATCH /api/v1/courses/:id
// @access  Private
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (
    course.user._id.toString() != req.user._id.toString() &&
    req.user.role !== 'admin'
  )
    return next(
      new AppError(
        'You are not bootcamp owner, you have no permission to update course to this bootcamp',
        403
      )
    );

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// @desc    Delete courses
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (
    course.user._id.toString() != req.user._id.toString() &&
    req.user.role !== 'admin'
  )
    return next(
      new AppError(
        'You are not bootcamp owner, you have no permission to update course to this bootcamp',
        403
      )
    );

  res.status(204).json({
    status: 'success',
    data: course
  });
});
