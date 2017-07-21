'use strict';

module.exports = (sequelize, { STRING, INTEGER }) => {
  const Test = sequelize.define('Test', {
    label: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    randomValue: {
      type: INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
      },
    },
  });

  return Test;
};
