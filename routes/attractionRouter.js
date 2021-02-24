const express = require('express');
const axios = require('axios');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const attractionController = require('../controllers/attractionController');

const router = express.Router();

router.route('/').get(attractionController.getAllAttractions);
router.route('/single').get(attractionController.getAttraction);
router.route('/availability').get(attractionController.availability);
router.route('/createBooking').post(attractionController.bookAttraction);

module.exports = router;
