const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required' },
          len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: 'users_email_unique',
          msg: 'Email address is already in use',
        },
        validate: {
          isEmail: { msg: 'Must be a valid email address' },
          notEmpty: { msg: 'Email is required' },
        },
        set(value) {
          if (value) {
            this.setDataValue('email', value.trim().toLowerCase());
          }
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'PLAYER',
        allowNull: false,
        validate: {
          isIn: {
            args: [['ADMIN', 'PLAYER']],
            msg: 'Role must be either ADMIN or PLAYER',
          },
        },
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
    }
  );

  // Instance methods
  User.prototype.validPassword = async function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  // Class helper
  User.hashPassword = async function (plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  };

  return User;
};
