const {Router} = require('express')
const Forest = require('./model')

const router = new Router()

router.get('/forest', (req, res, next) => {
  Forest.findAll()
  .then((forest)=> {
    return res.send(forest)
   })
  .catch(error => next(error))
})

router.post('/forest', (req, res, next) => {
  Forest.create(req.body)
  .then((forest) =>{
    return res.json(forest)
  })
  .catch(error => next(error))
})

module.exports = router