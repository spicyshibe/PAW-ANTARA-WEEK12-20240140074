const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define(
  'Feedback',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: 'feedbacks', timestamps: true }
);

module.exports = Feedback;
