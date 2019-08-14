const {Router} = require('express')
const Sse = require('json-sse')
const User = require('./user/model')

const Forest = require('./forest/model')
const Mushroomer = require('./mushroomer/model')

const stream = new Sse()
const router = new Router()

async function update () {
  const forests = await Forest.findAll({ include: [Mushroomer] })
  const data = JSON.stringify(forests) 
  stream.send(data)
}

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
    
    update()
    res.send(entity)
  }
)

router.post(
  '/join/:id', 
  async (req, res, next) => {

    const forest = await Forest.findByPk(req.params.id)
    const { status, turn } = forest
    
    if (status === 'joining') {
      const mushroomer = await Mushroomer.create(
        { 
          forestId: req.params.id, 
          userId: req.body.id 
        }
      )

      if (!turn) {
        await forest.update({ turn: mushroomer.id })
      }
    }
    
    update()
    res.send(forest)
  }
)

router.put(
  "/start/:id", 
  async (req, res, next) => {
    const forest = await Forest.findByPk(req.params.id, { include: [Mushroomer] })
    const { status, mushroomers } = forest

    if (status === 'joining' && mushroomers.length >= 2) {
      await forest.update({status: 'started'}) 
    }

    update()
    res.send(forest)
  }
)


router.put(
  '/roll/:id', 
  async (req, res, next) => {
    const mushroomer = await Mushroomer.findByPk(req.params.id)

    const { forestId } = mushroomer
    const forest = await Forest.findByPk(forestId, {
      include: [{
        model: Mushroomer,
        order: ['id', 'ASC']
      }]
    })
    const { status, turn, mushroomers } = forest

    if (status === 'started' && turn === mushroomer.id) {
      const roll = Math.ceil(Math.random() * 6)

      const newLocation = mushroomer.location + roll

      // .some » returns a boolean
      const good = forest.good.some(good => good === newLocation)
      const bad = forest.bad.some(bad => bad === newLocation)

      const yourIndex = mushroomers.findIndex(mush => mushroomer.id === mush.id)
      const nextIndex = yourIndex + 1
      const realIndex = nextIndex % mushroomers.length
      const nextMushroomer = mushroomers[realIndex]

      const mushroomerUpdate = {
        location: newLocation
      }
      const forestUpdate = {
        turn: nextMushroomer.id
      }

      if (newLocation >= 35) {
       forestUpdate.status = 'finished'
       mushroomerUpdate.location = 35
      }

      if (good) {
        mushroomerUpdate.good = mushroomer.good + 1
        forestUpdate.good = forest.good.filter(good => good !== newLocation)
      } else if (bad) {
        mushroomerUpdate.bad = mushroomer.bad + 1
        forestUpdate.bad = forest.bad.filter(bad => bad !== newLocation)
      }

      const updatedMushroomer = await mushroomer.update(mushroomerUpdate)
      await forest.update(forestUpdate)
      
      update()
      
      res.json(updatedMushroomer)
    }
  }
)

module.exports = router