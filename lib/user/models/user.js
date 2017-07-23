'use strict';

module.exports = (sequelize, { STRING, DATE }) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: STRING(120),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
          len: [1, 120],
        },
      },
      password: {
        type: STRING(60),
        allowNull: true,
        validate: { len: 60 },
      },
      lastname: {
        type: STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      firstname: {
        type: STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      username: {
        type: STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      // used for password recovery
      recoveryToken: {
        type: STRING,
        allowNull: true,
      },
      // token expiration used for password recovery
      tokenExpiration: {
        type: DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'User',
      classMethods: {
        associate(db) {
          this.belongsTo(db.UserRole, { as: 'role', foreignKey: 'roleId' });
          this.hasMany(db.UserBan, { as: 'bans', foreignKey: 'userId', onDelete: 'cascade' });
        },
      },
    }
  );

  return User;
};
