const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const attractionRouter = require('./routes/attractionRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// Adding incoming request data to the req.body
app.use(express.json({ limit: '10kb' })); // JSON Parser
app.use(express.urlencoded({ extended: true })); // Form parser
app.use(cookieParser()); // Cookie Parser

app.use(compression());

// ROUTES
app.use('/api/v1/attractions', attractionRouter);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
