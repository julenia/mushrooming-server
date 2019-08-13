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
  const turn = forest.turn
  console.log('turn',turn)
  if(status==='joining') {
    Mushroomer.create({forestId: req.params.id, userId: req.body.id})
    .then(mushroomer => {
      res.json(mushroomer)
      if(!turn) forest.update({turn: mushroomer.id})})
    .catch(error=>next(error))
  }
})

router.put('/forest/:id', (req, res, next)=> {
  Forest.findByPk(req.params.id)
  .then(forest => {
    if(req.body.status) forest.update({status: req.body.status})
    else if(req.body.mushroomerId) forest.update({turn: req.body.mushroomerId})
    res.json(forest)
  })
  .catch(next)
})

router.get('/mushroomer/:id', (req, res, next) => {
  Mushroomer.findByPk(req.params.id)
  .then(mushroomer => res.send(mushroomer))
  .catch(next)
})

router.put('/mushroomer/:id', async(req, res, next) => {
  const mushroomer = await Mushroomer.findByPk(req.params.id)
  const forestId = mushroomer.forestId
  const forest = await Forest.findByPk(forestId)
  const forestStatus = forest.status
  const turn = forest.turn
  const roll= req.body.roll
  if(forestStatus==='started' && turn === mushroomer.id){
    if(req.body.good){
      mushroomer.update({location: mushroomer.location+roll, good: mushroomer.good+req.body.good})
      res.json(mushroomer)
    }
    else if(req.body.bad){
      mushroomer.update({location: mushroomer.location+roll, bad: mushroomer.bad+req.body.bad})
      res.json(mushroomer)
    }
    else{
      mushroomer.update({location: mushroomer.location+roll})
      res.json(mushroomer)
    }
  }
})

module.exports = router