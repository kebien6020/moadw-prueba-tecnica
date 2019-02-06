const mongoose = require('mongoose')
const config = require('./config')()
const makeLogger = require('debug')

makeLogger('db:connect')(`Connecting to mongodb at ${config.db.connection}`)
mongoose.connect(config.db.connection, {useNewUrlParser: true})

const Hat = mongoose.Schema({
  name: String,
  price: Number,
  material: String,
})

const User = mongoose.models.User || mongoose.model('User', {
  email: String,
  hats: [Hat],
})

exports.User = User
exports.Hat = Hat
exports.db = mongoose.connection
