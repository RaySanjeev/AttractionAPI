const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const attractionRouter = require('./routes/attractionRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// COOKIE PARSER
app.use(cookieParser());

app.enable('trust proxy');

// Rate limiter
const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again after an hour.',
});
app.use('/api', limiter);

// Adding incoming request data to the req.body
app.use(express.json({ limit: '10kb' })); // JSON Parser
app.use(express.urlencoded({ extended: true })); // Form parser
app.use(cookieParser()); // Cookie Parser

app.use(compression());

// ROUTES
app.use('/api/v1/attractions', attractionRouter);

// ALL OTHER UNIDENTIFIED ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
