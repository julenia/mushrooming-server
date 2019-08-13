const Sequelize = require('sequelize')
const db = require('../db')
const User = require('../user/model')
const Forest = require('../forest/model')

const Mushroomer = db.define(
  'mushroomer',
  {
    location: {
      type: Sequelize.INTEGER,
      field: 'location',
      defaultValue: 0
    },
    good: {
      type: Sequelize.INTEGER,
      field: 'number_of_good_mushrooms',
      defaultValue: 0
    },
    bad: {
      type: Sequelize.INTEGER,
      field: 'number_of_bad_mushrooms',
      defaultValue: 0
    },
  },
  { tableName: 'mushroomers'}
  
);
Mushroomer.belongsTo(Forest)
Forest.hasMany(Mushroomer)


module.exports = Mushroomer