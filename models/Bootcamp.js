const mongoose = require('mongoose');
const slug = require('slugify');
const geocoder = require('./../utils/geoCoder');
const Course = require('./Course');

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
      unique: true,
      required: [true, 'Please add a name']
    },
    slug: String,
    description: {
      type: String,
      maxlength: [500, 'description cannot be more than 500 characters'],
      required: [true, 'Please add a description']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP / HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number cannot be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please add a valid email'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'] // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number]
      },
      street: String,
      city: String,
      stage: String,
      zipcode: String,
      formattedAddress: String,
      country: String
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must cannot be more than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
BootcampSchema.index({ location: '2dsphere' });

BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justone: false
});

// DOCUMENT MIDDLEQUARE
BootcampSchema.pre('save', function(next) {
  this.slug = slug(this.name, { lower: true });
  next();
});

BootcampSchema.pre('save', async function(next) {
  const res = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [res[0].longitude, res[0].latitude],
    street: res[0].streetName,
    city: res[0].city,
    stage: res[0].stateCode,
    zipcode: res[0].zipcode,
    formattedAddress: res[0].formattedAddress,
    country: res[0].countryCode
  };
  this.address = undefined;
  next();
});

// QUERY MIDDLEQUARE
BootcampSchema.post('findOneAndDelete', async function(doc, next) {
  await Course.deleteMany({ bootcamp: doc._id });
  next();
});
BootcampSchema.statics.isExisted = async function(bootcampID) {
  return (await this.findById(bootcampID)) ? true : false;
};

module.exports = mongoose.model('Bootcamp', BootcampSchema);
