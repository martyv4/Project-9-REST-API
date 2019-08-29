'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,

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
    Course.belongsTo(models.User); //auto-generate userId in Course linking to User model
  };
  return Course;
};