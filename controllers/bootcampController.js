const Bootcamp = require('./../models/Bootcamp');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../middlewares/asyncHandler');
const geocoder = require('./../utils/geoCoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getAllBootcamps = catchAsync(async (req, res, next) => {
  res.status(200).json(res.advanceResult);
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Public
exports.createBootcamp = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user._id });
  // If the user is not admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role != 'admin')
    return next(new AppError('You are already published a bootcamp', 400));
  const bootcamp = await Bootcamp.create(req.body);

  res.status(200).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new AppError(`Bootcamp not found with id: ${req.params.id}`, 404)
    );
  res.status(200).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Update  bootcamp
// @route   PATCH /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = catchAsync(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new AppError(`Bootcamp not found with id: ${req.params.id}`, 404)
    );

  if (
    bootcamp.user._id.toString() != req.user._id.toString() &&
    req.user.role !== 'admin'
  )
    return next(
      new AppError(
        'You are not bootcamp owner, you have no permission to access this route',
        403
      )
    );
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: bootcamp
  });
});

// @desc    Delete  bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new AppError(`Bootcamp not found with id: ${req.params.id}`, 404)
    );

  if (
    bootcamp.user._id.toString() != req.user._id.toString() &&
    req.user.role !== 'admin'
  )
    return next(
      new AppError(
        'You are not bootcamp owner, you have no permission to access this route',
        403
      )
    );

  await Bootcamp.findOneAndDelete({ _id: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get bootcamps with in a radius
// @route   GET /api/v1/bootcamps/center/:zipcode/distance/:distance
// @access  Private
exports.getBootcampsInRadius = catchAsync(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lng = loc[0].longitude;
  const lat = loc[0].latitude;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    status: 'success',
    results: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Upload photo for  bootcamp
// @route   PATCH /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = catchAsync(async (req, res, next) => {
  if (!req.files) return next(new AppError('Please upload a file', 400));

  const bootcamp = await Bootcamp.findById(req.params.id);

  if (
    bootcamp.user._id.toString() != req.user._id.toString() &&
    req.user.role !== 'admin'
  )
    return next(
      new AppError(
        'You are not bootcamp owner, you have no permission to access this route',
        403
      )
    );

  const { photo } = req.files;

  if (!photo.mimetype.startsWith('image'))
    return next(new AppError('Please upload an image file', 400));

  if (photo.size > process.env.MAX_FILE_UPLOAD)
    return next(
      new AppError(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );

  photo.name = `${bootcamp._id}-${Date.now()}-${photo.name}`;
  const err = await photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`);
  if (err) return next(new AppError('No such file or directory', 400));
  const updateBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    {
      photo: photo.name
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      photo: photo.name,
      bootcamp: updateBootcamp
    }
  });
});
