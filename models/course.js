'use strict';
//Sequelize Model
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: {
          msg: "title cannot be empty."
        },
        notNull: {
          msg: "title must be in the request."
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { 
        notEmpty: {
          msg: "description cannot be empty."
        },
        notNull: {
          msg: "description must be in the request."
        },
      },
    },

    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true
    },

    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true
    },


  }, {});
  
  //Relationship between the Courses and Users tables is defined (linking tables)
  Course.associate = function(models) {
    Course.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    }); //auto-generate userId in Course linking to User model
  };
  return Course;
};