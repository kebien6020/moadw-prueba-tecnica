const mongoose = require('mongoose')
const config = require('./config')()

mongoose.connect(config.db.connection, {useNewUrlParser: true})

const types = mongoose.Schema.Types

const User = mongoose.models.User || mongoose.model('User', {
  name: String,
  password: {
    type: String,
    select: false, // Hide from querys by default
  },
  role: {
    type: String,
    enum: ['basic', 'admin'],
    default: 'basic'
  },
})
const Sell = mongoose.models.Sell || mongoose.model('Sell', {
  product: String,
  value: String,
  qty: Number,
  userId: {
    type: types.ObjectId,
    ref: 'User',
  },
})

exports.User = User
exports.Sell = Sell
exports.db = mongoose.connection
