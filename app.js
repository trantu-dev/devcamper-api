const express = require('express');
const morgan = require('morgan');

const fileupload = require('express-fileupload');
const cookieparser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middlewares/error');
const courseRouter = require('./routers/courseRouter');
const bootcampRouter = require('./routers/bootcampRouter');
const authRouter = require('./routers/authRouter');
const userRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');

const app = express();

app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);
app.use(cors());
app.use(hpp());

// BODY PARSER
app.use(express.json());
app.use(cookieparser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));
app.use(fileupload());
app.use(mongoSanitize());

// ROUTER
app.use('/api/v1/bootcamps', bootcampRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// ERROR HANDLER
app.use(errorHandler);

module.exports = app;
