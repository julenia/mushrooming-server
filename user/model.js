const Sequelize = require('sequelize')
const db = require('../db')
//const Mushroomer = require('../mushroomer/model')
const User = db.define(
  'user',
  {
    nickname: {
      type: Sequelize.STRING,
      field: 'nickname',
      allowNull: false,
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
      field: 'number_of_points'
    },
    won_games: {
      type: Sequelize.INTEGER,
      field: 'number_of_won_games'
    },
    played_games: {
      type: Sequelize.INTEGER,
      field: 'number_of_played_games'
    }

  },
  { tableName: 'users'}
  
);
//User.hasMany(Mushroomer)


module.exports = User