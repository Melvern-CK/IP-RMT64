'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Team, { foreignKey: 'userId' });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Username must be unique' },
      validate: {
        notNull: { msg: 'Username is required' },
        notEmpty: { msg: 'Username cannot be empty' },
        len: {
          args: [3, 30],
          msg: 'Username must be between 3 and 30 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Email must be unique' },
      validate: {
        notNull: { msg: 'Email is required' },
        notEmpty: { msg: 'Email cannot be empty' },
        isEmail: { msg: 'Email format is invalid' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        notEmpty: { msg: 'Password cannot be empty' },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters'
        }
      }
    },
    googleId: DataTypes.STRING, // For Google login
    role: {
      type: DataTypes.STRING,
      defaultValue: 'trainer',
      validate: {
        isIn: {
          args: [['trainer', 'admin']],
          msg: 'Role must be either trainer or admin'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};