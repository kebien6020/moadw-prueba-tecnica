const app = require('./app')
const mongoose = require('mongoose')
const makeLogger = require('debug')
const PORT = process.env.PORT || 8100

const server = app.listen(PORT, () => {
  makeLogger('server:start')(`Listening on port ${PORT}`)
})

server.on('close', () => {
  makeLogger('server:shutdown')('Shutting down server')
  mongoose.connection.close(() => {
    makeLogger('db:close')('Closed connection to database')
  })
})
