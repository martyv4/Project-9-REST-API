// create the Express app
const express = require('express');
const app = express();

const Sequelize = require('sequelize');

app.get('/api/users', (req, res) => {
    res.return(200);
});

app.post('/api/users', (req, res) => {
    res.return(201);
});

app.get('/api/courses', (req, res) => {
    res.return(200);
});

app.get('/api/courses/:id', (req, res) => {
    res.return(200);
});

app.post('/api/courses', (req, res) => {
    res.return(201);
});

app.post('/api/courses/:id', (req, res) => {
    res.return(204);
});

app.delete('/api/courses/:id', (req, res) => {
    res.return(204);
});

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