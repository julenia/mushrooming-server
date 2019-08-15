const Sequelize = require('sequelize')
const db = require('../db')
const Mushroomer = require('../mushroomer/model')

const User = db.define(
  'user',
  {
    nickname: {
      type: Sequelize.STRING,
      field: 'nickname',
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      field: 'email',
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      field: 'password',
      allowNull: false,
    },
    image: {
      type: Sequelize.STRING,
      field: 'image',
    },
    points: {
      type: Sequelize.INTEGER,
      field: 'number_of_points',
      defaultValue: 0
    },
    won_games: {
      type: Sequelize.INTEGER,
      field: 'number_of_won_games',
      defaultValue: 0
    },
    played_games: {
      type: Sequelize.INTEGER,
      field: 'number_of_played_games',
      defaultValue: 0
    }

  },
  { tableName: 'users'}
  
);
 User.hasMany(Mushroomer)
 Mushroomer.belongsTo(User)


module.exports = User