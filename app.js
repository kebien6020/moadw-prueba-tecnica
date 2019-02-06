const express = require('express')
const routes = require('./routes')
const { refreshRecommendations } = require('./routes/users')
const errorMiddleware = require('./errors/middleware')

const app = express()

app.use(routes)
app.use(errorMiddleware)

// When testing refresh the recommendations manually to not mess up with the
// timeout
if (process.env.NODE_ENV !== 'test')
  // This call is asyncrhonous, just kickoff the command
  refreshRecommendations()

module.exports = app // For testing
