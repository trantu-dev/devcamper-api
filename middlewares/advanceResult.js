// test newFeature
const catchAsync = require('./asyncHandler');

const advanceResult = (model, populate) =>
  catchAsync(async (req, res, next) => {
    let query;
    if (req.params.bootcampID) {
      query = model.find({ bootcamp: req.params.bootcampID });
    } else {
      query = model.find();
    }

    const reqQuery = { ...req.query };

    // Exclude fields
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    excludeFields.forEach(field => delete reqQuery[field]);

    // Filter
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      match => `$${match}`
    );
    query = query.find(JSON.parse(queryStr));

    if (populate) query = query.populate(populate);

    // Select
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skip = (page - 1) * limit;
    let total;

    if (req.params.bootcampID) {
      total = (await model.find({ bootcamp: req.params.bootcampID })).length;
    } else {
      total = await model.countDocuments();
    }
    const pagination = {};

    if (total - page * limit > 0) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (skip > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    query = query.skip(skip).limit(limit);

    const data = await query;

    res.advanceResult = {
      status: 'success',
      pagination,
      results: data.length,
      data
    };
    next();
  });
module.exports = advanceResult;
