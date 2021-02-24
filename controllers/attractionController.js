const fs = require('fs');
const axios = require('axios');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

let attraction, availability;

exports.getAllAttractions = async (req, res, next) => {
  if (!req.query) {
    next(
      new AppError(
        'Please provide the country name, city, category, currency',
        400
      )
    );
  }

  const { country, city, category, currency } = req.query;
  const page = req.query.page ? req.query.page : 1;

  var config = {
    method: 'get',
    url: `https://test.agidmc.com/v1/attractions?country=${country}&city=${city}&page=${page}&category=${category}&currency=${currency}`,

    headers: {
      'API-Key': process.env.API_Key,
      Cookie: '__cfduid=d46ff57c49cad1f38d9d60e456a84ce0d1614066410',
    },
  };

  axios(config)
    .then(function (response) {
      res.status(200).json({
        status: 'success',
        data: {
          attractions: response.data,
        },
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

exports.getAttraction = catchAsync(async (req, res, next) => {
  if (!req.query) {
    next(
      new AppError(
        'Please provide the country name, city, category, currency',
        400
      )
    );
  }

  const { id, currency } = req.query;

  var config = {
    method: 'get',
    url: `https://test.agidmc.com/v1/attraction?id=${id}&currency=${currency}`,
    headers: {
      'API-Key': process.env.API_Key,
      Cookie: '__cfduid=d46ff57c49cad1f38d9d60e456a84ce0d1614066410',
    },
  };

  axios(config)
    .then(function (response) {
      attraction = response.data;
      fs.writeFile(
        './StaticData/attraction.txt',
        JSON.stringify(response.data),
        function () {
          console.log('File saved into attraction');
        }
      );
      res.status(200).json({
        status: 'success',
        data: {
          attraction: response.data,
        },
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

exports.availability = catchAsync(async (req, res, next) => {
  const { id, startDate, endDate, currency, type, count } = req.body;

  var config = {
    method: 'POST',
    url: `https://test.agidmc.com/v1/priceAndAvailability`,
    data: {
      id,
      start: startDate,
      end: endDate,
      types: [
        {
          type,
          count,
        },
      ],
      currency,
    },
    headers: {
      'API-Key': process.env.API_Key,
      Cookie: '__cfduid=d46ff57c49cad1f38d9d60e456a84ce0d1614066410',
    },
  };

  axios(config)
    .then(function (response) {
      availability = response.data;
      fs.writeFile(
        './StaticData/availability.txt',
        JSON.stringify(response.data),
        function () {
          console.log('File saved into availability');
        }
      );
      res.status(200).json({
        status: 'success',
        data: {
          availability: response.data,
        },
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

const createBookingObj = (
  availability,
  attraction,
  userDetails,
  questionsArrayAns
) => {
  let questionArray = [];

  attraction.data.ticketTypesAndPackages[0].questions.forEach((el, index) => {
    const obj = {
      id: el.id,
      answer: questionsArrayAns[index],
    };
    questionArray.push(obj);
  });

  return {
    firstName: userDetails.firstName,
    lastName: userDetails.lastName,
    personTitle: userDetails.personTitle,
    email: userDetails.email,
    phone: userDetails.phone,
    passport: userDetails.passport,
    date: '2021-05-20',
    pickup: '',
    dropoff: '',
    protect: 'true',
    comments: userDetails.comments,
    currency: attraction.data.currency,
    bookings: [
      {
        id: availability.data.prices[0].id,
        type: 'ADULT',
        ticketId: availability.data.id,
        attractionId: attraction.data.id,
        questions: questionArray,
        isLead: true,
      },
    ],
  };
};

exports.bookAttraction = catchAsync(async (req, res, next) => {
  const questionsArrayAns = [
    req.body.firstName,
    req.body.lastName,
    req.body.DOB,
    req.body.passport,
    req.body.issuePassport,
    req.body.expirePassport,
    req.body.nationality,
    req.body.gender,
    req.body.hotel,
  ];
  const userDetails = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    passport: req.body.passport,
    personTitle: req.body.personTitle,
    email: req.body.email,
    phone: req.body.phone,
    comments: req.body.comments,
  };

  const config = {
    method: 'POST',
    url: `https://test.agidmc.com/v1/createBooking`,
    data: createBookingObj(
      availability,
      attraction,
      userDetails,
      questionsArrayAns
    ),
    headers: {
      'API-Key': process.env.API_Key,
      Cookie: '__cfduid=d46ff57c49cad1f38d9d60e456a84ce0d1614066410',
    },
  };

  axios(config)
    .then(function (response) {
      res.status(200).json({
        status: 'success',
        data: {
          booked: response.data,
        },
      });
      fs.writeFile(
        './StaticData/booking.txt',
        JSON.stringify(response.data),
        function () {
          console.log('File saved into booking');
        }
      );
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
});
