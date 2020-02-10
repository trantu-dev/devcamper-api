const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add a number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimumSkill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false
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

courseSchema.statics.getAverageCost = async function(bootcampID) {
  const stats = await this.aggregate([
    { $match: { bootcamp: bootcampID } },
    { $group: { _id: null, averageCost: { $avg: '$tuition' } } }
  ]);
  await this.model('Bootcamp').findByIdAndUpdate(bootcampID, {
    averageCost: Math.ceil(stats[0].averageCost / 10) * 10
  });
};

// DOCUMENT MIDDLEWARE
courseSchema.post('save', function(doc, next) {
  doc.constructor.getAverageCost(doc.bootcamp);
  next();
});

// QUERY MIDDLEQUARE
courseSchema.post('findOneAndDelete', function(doc, next) {
  doc.constructor.getAverageCost(doc.bootcamp);
  next();
});

module.exports = mongoose.model('Course', courseSchema);
