const dotenv = require('dotenv');

// HANDLING ANY OTHER ASYNC ERRORS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting Dowm.....');
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

// ADDING ENVIRONMENT VARIABLES
dotenv.config({ path: `${__dirname}/config.env` });

// REQUIRING THE APP
const app = require('./app');

// PORT
const PORT = 3000 || process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server is listening to port : ${PORT}`);
});

// HANDLING PROMISE REJECETION
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥. Shutting Down.');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
