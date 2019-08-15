const { Router } = require('express')
const Sse = require('json-sse')
const User = require('./user/model')

const Forest = require('./forest/model')
const Mushroomer = require('./mushroomer/model')

const stream = new Sse()
const router = new Router()

const { toJWT } = require('./auth/jwt')
const bcrypt = require('bcrypt')
const auth = require('./auth/middleware')

async function update() {
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
      await forest.update({ status: 'started' })
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

router.post(
  '/user',
  async (req, res, next) => {
    const { nickname, email, password, image } = req.body
    const user = await User.findOne({ where: { email: email } })

    if (user) {
      res.status(403).send("Email address already used.")
    } else {
      const encryptedUser = {
        nickname,
        email,
        image,
        password: bcrypt.hashSync(password, 10)
      }

      const entity = await User
        .create(encryptedUser)
      res.send(entity)
    }
  }
)

// login
router.post(
  '/login',
  (req, res, next) => {
    console.log("req.body", req.body)
    User
      .findOne({
        where: {
          email: req.body.email
        }
      })
      .then(entity => {
        if (!entity) {
          res.status(400).send({
            message: 'User with that email does not exist'
          })
        }

        // 2. use bcrypt.compareSync to check the password against the stored hash
        if (bcrypt.compareSync(req.body.password, entity.password)) {
        // if (req.body.password === entity.password) {
          // 3. if the password is correct, return a JWT with the userId of the user (user.id)
          res.send({
            // jwt: toJWT({ userId: 1 })
            jwt: toJWT({ userId: entity.id })
          })
        } else {
          res.status(400).send({
            message: 'Password was incorrect'
          })
        }
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({
          message: 'Something went wrong'
        })
      })
  }
)

router.get('/secret-endpoint', auth, (req, res) => {
  res.send({
    message: `Thanks for visiting the secret endpoint ${req.user.email}.`
  })
})

module.exports = router