const app = require('./app')
const PORT = process.env.PORT || 8100

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

server.on('close', () => {
  console.log('Shutting down server')
  mongoose.connection.close(() => {
    console.log('Closed connection to database')
  })
})
