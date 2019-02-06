const express = require('express')
const routes = require('./routes')
const errorMiddleware = require('./errors/middleware')

const app = express()

app.use(routes)
app.use(errorMiddleware)

module.exports = app // For testing
