'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: {
          msg: "firstName cannot be empty."
        },
        notNull: {
          msg: "firstName must be in the request."
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: {
          msg: "lastName cannot be empty."
        },
        notNull: {
          msg: "lastName must be in the request."
        },
      },
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: {
          msg: "emailAddress cannot be empty."
        },
        notNull: {
          msg: "emailAddress must be in the request."
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: {
          msg: "password cannot be empty."
        },
        notNull: {
          msg: "password must be in the request."
        },
      },
    },
  }, {});
  //Relationship between the Users and Courses tables is defined (linking tables)
  User.associate = function(models) {
    User.hasMany(models.Course); //grants access to user.getCourses()
  };
  return User;
};