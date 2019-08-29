// create the Express app
const express = require('express');
const app = express();

const Sequelize = require('sequelize');

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
    const sql = new Sequelize({
      dialect: 'sqlite',
      storage: 'fsjstd-restapi.db'
    });

const test = sql.authenticate()
.then(function () {
    console.log("CONNECTED! ");
})
.catch(function (err) {
    console.log("FAILED");
})
.done(); 
res.json({
  message: 'Welcome to the REST API project!',
});
});

// send 404 if no other route matched
app.use((req, res) => {
res.status(404).json({
  message: 'Route Not Found',
});
});

// setup a global error handler
app.use((err, req, res, next) => {
if (enableGlobalErrorLogging) {
  console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
}

res.status(err.status || 500).json({
  message: err.message,
  error: {},
});
});

module.exports = app;