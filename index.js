const express = require('express')
const app = express()
const cors = require('cors')
const middleware = cors()
const bodyParses = require('body-parser')
const jsonParser = bodyParses.json()
const port = process.env.PORT || 4000
const router = require('./router')

app.use(middleware)
app.use(jsonParser)
app.use(router)

app.listen(port, ()=> console.log(`Listening on port: ${port}`))