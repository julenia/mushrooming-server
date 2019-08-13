const {Router} = require('express')
const User = require('./user/model')
const Mushroomer = require('./mushroomer/model')
const Forest = require('./forest/model')

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
router.get('/forest/:id', (req, res, next) =>{
  Forest.findByPk(req.params.id)
  .then(forest => res.send(forest))
  .catch(next)
})

router.post('/forest/:id', 
  async (req, res, next) => {
  const forest = await Forest.findByPk(req.params.id)
  const status = forest.status
  console.log('req.params.id',req.params.id)
  console.log('req.body', req.body)
  console.log('status', status)

  if(status==='joining') {
    Mushroomer.create({forestId: req.params.id, userId: req.body.id})
    .then(mushroomer => res.json(mushroomer))
    .catch(error=>next(error))
  }
})

module.exports = router