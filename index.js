const express = require('express')
const app = express()
const cors = require('cors')
const middleware = cors()
const bodyParses = require('body-parser')
const jsonParser = bodyParses.json()
const port = process.env.PORT || 4000

app.use(middleware)
app.use(jsonParser)

app.listen(port, ()=> console.log(`Listening on port: ${port}`))