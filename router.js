const {Router} = require('express')
const Sse = require('json-sse')
const User = require('./user/model')

const Forest = require('./forest/model')
const Mushroomer = require('./mushroomer/model')

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

// user playing through mushroomer »
// Should it be in the stream???
// router.get(
//   '/stream',
//   async (req, res, next) => {
//     const user = await User
//       .findAll({ include: [Mushroomer] })

//     const data = JSON.stringify(user)
//     stream.updateInit(data)
//     stream.init(req, res)
//   }
// )

router.post(
  '/user',
  async (req, res, next) => {
  const { nickname, email, password, image } = req.body
  const entity = await User.create({ 
    nickname, 
    email, 
    password, 
    image 
  })
  const user = await User.findAll({ include: [Mushroomer] })
  const data = JSON.stringify(user) 

  stream.updateInit(data)
  stream.send(data)

  res.send(entity)
})

router.post(
  '/forest',
  async (req, res, next) => {
  console.log('forest post req.body:', req.body)
  const { name } = req.body
  const entity = await Forest.create({ 
    name
  })
  const forest = await Forest.findAll({ include: [Mushroomer] })
  const data = JSON.stringify(forest) 

  stream.updateInit(data)
  stream.send(data)

  res.send(entity)
})

router.get(
  '/forest/:id',
  async (req, res, next) => {
  const forest = await Forest.findByPk(req.params.id, { include: [Mushroomer] })
  const data = JSON.stringify(forest) 

  stream.updateInit(data)
  stream.send(data)

  res.send(forest)
  }
)

router.post(
  '/forest/:id', 
  async (req, res, next) => {

    const forest = await Forest.findByPk(
      req.params.id, 
      { include: [Mushroomer] }
    )

    const status = forest.status
    const turn = forest.turn
    
    if(status==='joining') {
      const mushroomer = await Mushroomer.create(
        { 
          forestId: req.params.id, 
          userId: req.body.id 
        }
      )
      
      res.json(mushroomer)

      if(!turn) {
        forest.update({turn: mushroomer.id})
      }
    }
    
    const data = JSON.stringify(forest)

    stream.updateInit(data)
    stream.send(data)

    res.send(forest)
  }
)

router.put(
  '/forest/:id', 
  async (req, res, next) => {
  const forest = await Forest.findByPk(req.params.id)
  
    if(req.body.status) {
      forest.update({status: req.body.status})
    } else if (req.body.mushroomerId) {
      forest.update({turn: req.body.mushroomerId})
    }

    const data = JSON.stringify(forest)

    stream.updateInit(data)
    stream.send(data)
    
    res.json(forest)
  }
)

router.get(
  '/mushroomer/:id', 
  async (req, res, next) => {
    const mushroomer = await Mushroomer.findByPk(req.params.id)

    const data = JSON.stringify(mushroomer)

    stream.updateInit(data)
    stream.send(data)
    
    res.send(mushroomer)
  
  }
)

// make the good and bad loc disappear after beeing picked up » done
// mushroomer on location 35 » finish the game
router.put(
  '/mushroomer/:id', 
  async (req, res, next) => {
    const mushroomer = await Mushroomer.findByPk(req.params.id)

    const forestId = mushroomer.forestId
    const forest = await Forest.findByPk(forestId)
    const forestStatus = forest.status
    const turn = forest.turn

    const roll = Math.ceil(Math.random() * 6)

    if (forestStatus === 'started' && turn === mushroomer.id) {
      const newLocation = mushroomer.location + roll
      // finish game
      if (newLocation >= 35) {
        await forest.update({status: 'finished'})
      } else {
        // .some » returns a boolean
        const good = forest.good.some(good => good === newLocation)
        const bad = forest.bad.some(bad => bad === newLocation)

        const mushroomerUpdate = { location: newLocation }
        const forestUpdate = {}

        if (good) {
          mushroomerUpdate.good = mushroomer.good + 1
          forestUpdate.good = forest.good.filter(good => good !== newLocation)
        } else if (bad) {
          mushroomerUpdate.bad = mushroomer.bad + 1
          forestUpdate.bad = forest.bad.filter(bad => bad !== newLocation)
        }

        const updatedMushroomer = await mushroomer.update(mushroomerUpdate)
        await forest.update(forestUpdate)
      }
      
      const forests = await Forest.findAll({ include: [Mushroomer] })
      const data = JSON.stringify(forests)
      stream.send(data)
      
      res.json(updatedMushroomer)
    }
  }
)

module.exports = router