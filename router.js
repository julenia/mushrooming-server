const {Router} = require('express')
const Sse = require('json-sse')
const User = require('./user/model')
const Mushroomer = require('./mushroomer/model')
const Forest = require('./forest/model')
const stream = new Sse()
const router = new Router()

router.get(
  '/stream',
  async (request, response) => {
    const forests = await Forest
      .findAll({ include: [Mushroomer] })

    const data = JSON.stringify(forests)
    stream.updateInit(data)
    stream.init(request, response)
  }
)

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
// router.get('/forest', (req, res, next) => {
//   Forest.findAll()
//   .then((forest)=> {
//     return res.send(forest)
//    })
//   .catch(error => next(error))
// })

router.post('/forest', (req, res, next) => {
  Forest.create(req.body)
  .then((forest) =>{
    const data = JSON.stringify(forest)

    stream.updateInit(data)
    stream.send(data)
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
  const forest = await Forest.findByPk(req.params.id,{include: [Mushroomer]})
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
    const data = JSON.stringify(forest)
    stream.updateInit(data)
    stream.send(data)
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
  const roll= parseInt(req.body.roll)
  if(forestStatus==='started' && turn === mushroomer.id){
    const good=forest.good.filter(good=>good===(mushroomer.location+roll))
    const bad=forest.bad.filter(bad=>bad===(mushroomer.location+roll))
    if(good.length){
      mushroomer.update({location: mushroomer.location+roll, good: mushroomer.good+1})
      .then(mush=>res.json(mush))
      .catch(next)
    }
    else if(bad.length){
      mushroomer.update({location: mushroomer.location+roll, bad: mushroomer.bad+1})
      .then(mush=>res.json(mush))
    }
    else{
      mushroomer.update({location: mushroomer.location+roll})
      .then(mush=>res.json(mush))
    }
  }
})

module.exports = router