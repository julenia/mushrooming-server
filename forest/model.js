const Sequelize = require('sequelize')
const db = require('../db')

const Forest = db.define(
  'forest',
  {
    name: {
      type: Sequelize.STRING,
      field: 'name',
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      field: 'status',
      allowNull: false,
      defaultValue: 'joining',
      values: ['joining', 'started', 'finished']
    },
    turn: {
      type: Sequelize.INTEGER,
      field: 'next_mushroomerId',
    },
    good: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      field: 'good_mushrooms',
      defaultValue: [1,4,6,11,14,20,23,26,29,32,34]
    },
    bad: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      field: 'bad_mushrooms',
      defaultValue: [3,9,22,25,31,33]
    }

  },
  { tableName: 'forests'}
  
);


module.exports = Forest