const express = require('express')
const app = express()
const cors = require('cors')
const middleware = cors()
const bodyParses = require('body-parser')
const jsonParser = bodyParses.json()
const port = process.env.PORT || 4000
const userRouter = require('./user/router')
const forestRouter =require('./forest/router')

app.use(middleware)
app.use(jsonParser)
app.use(userRouter)
app.use(forestRouter)

app.listen(port, ()=> console.log(`Listening on port: ${port}`))