const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewSchema.statics.getAverageRating = async function(bootcampID) {
  const stats = await this.aggregate([
    { $match: { bootcamp: bootcampID } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } }
  ]);
  await this.model('Bootcamp').findByIdAndUpdate(bootcampID, {
    averageRating: stats[0].averageRating
  });
};

// DOCUMENT MIDDLEWARE
reviewSchema.post('save', async function(doc, next) {
  await doc.constructor.getAverageRating(doc.bootcamp);
  next();
});

// QUERY MIDDLEQUARE
reviewSchema.post('findOneAndDelete', async function(doc, next) {
  await doc.constructor.getAverageRating(doc.bootcamp);
  next();
});

module.exports = mongoose.model('Reivew', reviewSchema);
