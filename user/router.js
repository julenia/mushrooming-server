const {Router} = require('express')
const User = require('./model')

const router = new Router()

router.get('/user', (req, res, next) => {
  User.findAll()
  .then((user)=> {
    return res.send(user)
   })
  .catch(error => next(error))
})

router.post('/user', (req, res, next) => {
  User.create(req.body)
  .then((user) =>{
    return res.json(user)
  })
  .catch(error => next(error))
})

module.exports = router