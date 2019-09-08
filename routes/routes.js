// create the Express app
const express = require('express');
const app = express();

const Sequelize = require('sequelize');

//controls whether it writes any error message to the console
const enableGlobalErrorLogging = false;

//Body-parser:  informs the application what format http request bodys will contain, in our case everything is JSON
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//load bcryptjs package to encrypt and decrypt password values
const bcrypt = require('bcryptjs');

//allows receipt of authentication header in http request
const auth = require('basic-auth');

//Sequelize DB object typical way to get Sequelize DB object
app.set('models', require('../models'));

//used in /api/courses and /api/courses/:id to reduce displayed attributes from User and Course models
const attributesCourse = ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'];
const attributesUser = ['id', 'firstName', 'lastName', 'emailAddress'];

//Validation of email address validity
const validationEmailInput = (str) => {
//Validate the e-mail field if false then give an error message
  //https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(str)
}

//AUTHENTICATION MIDDLEWARE
//modified from example in
//https://teamtreehouse.com/library/rest-api-authentication-with-express
const authenticateUser = (req, res, next) => {
  let message = null;

  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (!credentials) {
    console.warn('Auth header not found');
    
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  }
  else
  {
    // Attempt to retrieve the user from the data store
    // by their username (i.e. the user's "key"
    // from the Authorization header).
    const User = app.get('models').User;

    //const user = User.find(u => u.emailAddress === credentials.emailAddress);
    const user = User.findOne({
      where: {emailAddress: credentials.name},
      //DO NOT reduce the query: we need the User.password later
      //delete it when necessary, such as /api/users
      //attributes: attributesUser,
    })
    .then((user) => {

      if (user) {
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
        const authenticated = bcrypt.compareSync(credentials.pass, user.password);

        // If the passwords match...
        if (authenticated) {
          console.log(`Authentication successful for emailAddress: ${user.emailAddress}`);

          // Then store the retrieved user object on the request object
          // so any middleware functions that follow this middleware function
          // will have access to the user's information.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
        }
      }
      else {
        message = `User not found for username: ${credentials.name}`;
      }
      if (message) {
        console.warn(message);
    
        // Return a response with a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access Denied' });
      } else {
        // Or if user authentication succeeded...
        // Call the next() method.
        next();
      }
    });
  } 
}

//USER ROUTES
  //Send a GET request to /api/users to show users
  //Returns HTTP: Status Code 200 means OK
  //Authentication
app.get('/api/users', authenticateUser, (req, res, next) => {
    res.status(200);

    //convert User model object to JSON
    //https://www.w3schools.com/jsref/jsref_tojson.asp
    const jsonResponse = req.currentUser.toJSON();

    //delete three attributes to hide from user
    //https://stackoverflow.com/questions/5310304/remove-json-element
    delete jsonResponse["password"];
    delete jsonResponse["createdAt"];
    delete jsonResponse["updatedAt"];
  
    //return the reduced JSON to the client
    res.json(jsonResponse);
});

//USER ROUTES
  //Send a POST request to /api/users to create a user
  //Returns HTTP: Status Code 201 means Created
  //in the event of a validation error returns a 400 error means Bad Request
app.post('/api/users', (req, res, next) => {
  const user = req.body;

  //Use input validators for emailAddress and password, then use Sequelize validation for the entire model User
  
    const errors = [];

    /*
    if (!user.firstName) {
      errors.push('Please provide a value for "firstName"');
    }
    if (!user.lastName) {
      errors.push('Please provide a value for "lastName"');
    }
    */
    if (!user.emailAddress) {
      errors.push('Please provide a value for "emailAddress"');
    }
    if (!user.password) {
      errors.push('Please provide a value for "password"');
    }
    
    if (errors.length != 0)
    {
      res.status(400);
      res.json({"messages" : errors});
    }
    else
    {
      if (!validationEmailInput(user.emailAddress))
      {
        res.status(400);
        res.json({"message": "Parameter emailAddress is not a valid email address."});
      }
      else
      {
        const User = app.get('models').User;

        User.findOne({
          where: {emailAddress: user.emailAddress}
        })
        .then((checkUser) => {
          if (!checkUser)
          {
            user.password = bcrypt.hashSync(user.password, 8);
              User.create(user)
              .then(() => {
                res.set('Location', "/");
                res.status(201);
                res.send();
              })
              .catch((err) => {
                //https://stackoverflow.com/questions/16507222/create-json-object-dynamically-via-javascript-without-concate-strings
                if (err.name === "SequelizeValidationError") {
                  res.status(400);
                  res.json({ "name": err.name, "message": err.errors[0].message, "type": err.errors[0].type});
                }
                else
                {
                  throw err;
                }
              })
              .catch((err) => {
                next(new Error(err));
              });
          }
          else
          {
            res.status(400);
            res.json({"message": "Given emailAddress already in use."});
          }
        });
    }
  }
});

//COURSE ROUTES
  //Send a GET request to /api/courses to list courses
  //Returns HTTP: Status Code 200 means OK
  //https://stackoverflow.com/questions/21883484/how-to-use-an-include-with-attributes-with-sequelize
app.get('/api/courses', (req, res, next) => {

  const Course = app.get('models').Course;
  const User = app.get('models').User;
//get list of courses
  Course.findAll({
    order: [
        ['title', 'ASC'],
    ],
    attributes: attributesCourse,
    include: [
      { model: User, as: 'user', attributes: attributesUser }
    ]
  })
  .then((courseList) => {
    res.status(200);
    res.json(courseList);
  });
});

//COURSE ROUTES
  //Send a GET request to /api/courses/:id to show course
  //Returns HTTP: Status Code 200 means OK  
app.get('/api/courses/:id', (req, res, next) => {
  const Course = app.get('models').Course;
  const User = app.get('models').User;
  Course.findByPk(req.params.id, {
    attributes: attributesCourse,
    include: [
      { model: User, as: 'user', attributes: attributesUser }
    ]
  })
  .then((foundCourse) => {
    if (foundCourse)
    {
      res.status(200);
      res.json(foundCourse);
    }
    else
    {
      //Render 404 if the book at :id is not in the database
      res.status(404);
      res.json({ "message": "Course not found for ID " + req.params.id});
    }
  })
  .catch((err) => {
    next(new Error(err));
  });
});

//COURSE ROUTES
  //Send a POST request to /api/courses to create courses
  //Returns HTTP: Status Code 201 means Created
  //Authentication
app.post('/api/courses', authenticateUser, (req, res, next) => {
  const course = req.body;

  //replace middleware input validation with Sequelize validators
  /*
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
     res.json({"messages" : errors});
  }
  else
  {
    */

    //create the course
    //set HTTP header to the URI for the course
    const Course = app.get('models').Course;

      course.userId = req.currentUser.id;

      Course.create(course)
      .then((course) => {
        const fullUrl = req.protocol + '://' + req.get('host') + "/api/course/" + course.id;
        res.set('Location', fullUrl);
      })
      .then(() => {
        res.status(201);
        res.send();
      })
      .catch((err) => {
        if (err.name === "SequelizeValidationError") {
          res.status(400);
          res.json({ "name": err.name, "message": err.errors[0].message, "type": err.errors[0].type});
        }
        else
        {
          throw err;
        }
      })
      .catch((err) => {
        next(new Error(err));
      });
  //}
});

//COURSE ROUTES
  //Send a PUT request to /api/courses/:id to update courses
  //Returns HTTP: Status Code 204 means No Content
  //Authentication
app.put('/api/courses/:id', authenticateUser, (req, res, next) => {
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
    const Course = app.get('models').Course;

  //Update the course at ID :id

    Course.findByPk(req.params.id)
    .then((foundCourse) => {
      if (!foundCourse)
      {
        res.status(400);
        res.json({ "message": "Course not found for ID " + req.params.id});
      }
      else
      {
        if (foundCourse.userId === req.currentUser.id)
        {
            Course.update(req.body,
            {
              where: {id: req.params.id}
            })
            .then(() => {
              res.status(204);
              res.send();
            })
            .catch((err) => {
              if (err.name === "SequelizeValidationError") {
                res.status(400);
                res.json({ "name": err.name, "message": err.errors[0].message, "type": err.errors[0].type});
              }
              else
              {
                throw err;
              }
            })
            .catch((err) => {
              next(new Error(err));
            });
        }
        else
        {
          res.status(403);
          res.json({ "message": "Course does not belong to currently authenticated user."})
        }
      }
    })

  //TODO: check if ID exists, exception if not

    
  }
});

//COURSE ROUTES
  //Send a DELETE request to /api/courses/:id to delete courses
  //Authentication  
app.delete('/api/courses/:id', authenticateUser, (req, res, next) => {
    //delete the course at ID :id - check if it exists first
    const Course = app.get('models').Course;


    Course.findByPk(req.params.id).then((foundCourse) => {
      if (foundCourse)
      {

        if (foundCourse.userId === req.currentUser.id)
        {
          Course.destroy({
            where: {id: req.params.id}
          }).then(() => {
            res.status(204);
            res.send();
          })
          .catch((err) => {
            next(new Error(err));
          });
        }
        else
        {
          res.status(403);
          res.json({ "message": "Course does not belong to currently authenticated user."})
        }
      }
      else
      {
        res.status(404);
        res.json({ "message": "Course not found for ID " + req.params.id});
      }
    })
    .catch((err) => {
      next(new Error(err));
    });
    
});

  // setup a friendly greeting for the root route
app.get('/', (req, res) => {
res.json({
  message: 'Welcome to the REST API project!',
});
});

//Test database connection on startup
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

// send 404 if no other route matched
app.use((req, res, next) => {
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
    error: {}
  });
});

module.exports = app;