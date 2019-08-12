const {Router} = require('express')
const Mushroomer = require('./model')

const router = new Router()

// router.put('/mushroomer/:id', (req, res, next) => {
//   Mushroomer.update()
//   .then((forest)=> {
//     return res.send(forest)
//    })
//   .catch(error => next(error))
// })

// router.post('/forest', (req, res, next) => {
//   Forest.create(req.body)
//   .then((forest) =>{
//     return res.json(forest)
//   })
//   .catch(error => next(error))
// })

module.exports = router