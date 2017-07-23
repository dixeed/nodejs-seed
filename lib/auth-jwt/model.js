'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlacklistToken = sequelize.define(
    'BlacklistToken',
    {
      expire: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
    },
    { tableName: 'BlackListToken' }
  );

  return BlacklistToken;
};
