const mongoose = require('mongoose')
const config = require('./config')()
const makeLogger = require('debug')

makeLogger('db:connect')(`Connecting to mongodb at ${config.db.connection}`)
mongoose.connect(config.db.connection, {useNewUrlParser: true})

const HatSchema = mongoose.Schema({
  _id: String,
  name: String,
  price: Number,
  material: String,
})

const UserSchema = mongoose.Schema({
  _id: String,
  email: String,
  hats: [{
    type: String,
    ref: 'Hat',
  }],
})

const Hat = mongoose.models.Hat || mongoose.model('Hat', HatSchema)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

exports.User = User
exports.Hat = Hat
exports.db = mongoose.connection
