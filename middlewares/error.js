const AppError = require('./../utils/AppError');

const errorHandler = (err, req, res, next) => {
  console.log(err);
  let error = { ...err };

  if (err.name === 'CastError') {
    const msg = `Resource not found with id: ${err.value}`;
    error = new AppError(msg, 404);
  }

  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(el => el.message);
    error = new AppError(msg, 400);
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    const msg = `Duplicate field ${fields}`;
    error = new AppError(msg, 400);
  }

  res.status(error.statusCode || 500).json({
    status: error.statusCode ? 'fail' : 'error',
    error: error.message || 'Server error'
  });
};
module.exports = errorHandler;
