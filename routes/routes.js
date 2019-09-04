// create the Express app
const express = require('express');
const app = express();

const Sequelize = require('sequelize');

const { check, validationResult } = require('express-validator');

//Body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//load bcryptjs package to encrypt and decrypt password values
const bcrypt = require('bcryptjs');

//USER ROUTES
  //Send a GET request to /api/users to show users
  //Returns HTTP: Status Code 200 means OK
app.get('/api/users', (req, res) => {
    res.status(200);
    res.json('{}');
    //res.json(data);
});

//USER ROUTES
  //Send a POST request to /api/users to create users
  //Returns HTTP: Status Code 201 means Created
  //in the event of a validation error returns a 400 error means Bad Request
app.post('/api/users', (req, res) => {
  const user = req.body;

    const errors = [];

    if (!user.firstName) {
      errors.push('Please provide a value for "firstName"');
    }
    if (!user.lastName) {
      errors.push('Please provide a value for "lastName"');
    }
    if (!user.emailAddress) {
      errors.push('Please provide a value for "emailAddress"');
    }
    if (!user.password) {
      errors.push('Please provide a value for "password"');
    }
    
    if (errors.length != 0)
    {
      res.status(400);
      res.json(errors);
    }
    else
    {
      const hash = bcrypt.hashSync(user.password, 8);

      

      //create the user
      res.status(201);
      res.send();
    }
    
});

//COURSE ROUTES
  //Send a GET request to /api/courses to list courses
  //Returns HTTP: Status Code 200 means OK
app.get('/api/courses', (req, res) => {
    res.status(200);
    //get list of courses
    res.json('{}');
});

//COURSE ROUTES
  //Send a GET request to /api/courses/:id to show course
  //Returns HTTP: Status Code 200 means OK  
app.get('/api/courses/:id', (req, res) => {
    res.status(200);
    //lookup the course at this ID :id
    res.json('{}');
});

//COURSE ROUTES
  //Send a POST request to /api/courses to create courses
  //Returns HTTP: Status Code 201 means Created
app.post('/api/courses', (req, res) => {
  const course = req.body;

  const errors = [];

  if (!course.title) {
    errors.push('Please provide a value for "title"');
  }
  if (!course.description) {
    errors.push('Please provide a value for "description"');
  }

  if (errors.length != 0)
  {
    res.status(400);
    res.json(errors);
  }
  else
  {
    //create the course
    //set HTTP header to the URI for the course
    res.status(201);
    res.send();
  }
});

//COURSE ROUTES
  //Send a PUT request to /api/courses/:id to update courses
  //Returns HTTP: Status Code 204 means No Content
  
app.put('/api/courses/:id', (req, res) => {
  const course = req.body;

  const errors = [];

  if (!course.title) {
    errors.push('Please provide a value for "title"');
  }
  if (!course.description) {
    errors.push('Please provide a value for "description"');
  }

  if (errors.length != 0)
  {
    res.status(400);
    res.json(errors);
  }
  else
  {
    //Update the course at ID :id, check if it exists first
    res.status(204);
    res.send();
  }
});

//COURSE ROUTES
  //Send a DELETE request to /api/courses/:id to delete courses
app.delete('/api/courses/:id', (req, res) => {
    //delete the course at ID :id - check if it exists first
    res.status(204);
    res.send();
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