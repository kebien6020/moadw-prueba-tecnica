const app = require('./app')
const mongoose = require('mongoose')
const log = require('debug')('server')
const PORT = process.env.PORT || 8100

const server = app.listen(PORT, () => {
  log(`Listening on port ${PORT}`)
})

server.on('close', () => {
  log('Shutting down server')
  mongoose.connection.close(() => {
    log('Closed connection to database')
  })
})
