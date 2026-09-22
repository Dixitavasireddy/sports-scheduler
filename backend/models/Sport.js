const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sport = sequelize.define(
    'Sport',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: 'sports_name_unique',
          msg: 'Sport with this name already exists',
        },
        validate: {
          notEmpty: { msg: 'Sport name cannot be empty' },
          len: { args: [2, 100], msg: 'Sport name must be between 2 and 100 characters' },
        },
        set(value) {
          if (value) {
            this.setDataValue('name', value.trim());
          }
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'Sports',
      timestamps: true,
    }
  );

  return Sport;
};
