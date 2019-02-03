const express = require('express')
const { mongoose, User, Sell } = require('./db')

const app = express()

const PORT = 8100 || process.env.PORT

app.get('/', (req, res, next) => {
  res.json({success: true})
})

app.get('/users', async (req, res, next) => {
  const users = await User.find()
  res.json({success: true, users})
})

app.get('/users/:id', async (req, res, next) => {
  const user = await User.findById(req.params.id)
  const sells = await Sell.find({userId: user._id})
  const userWithSells = Object.assign({}, user._doc, {sells})
  res.json({success:true, user: userWithSells})
})

app.get('/sells', async (req, res, next) => {
  const sells = await Sell.find()
  res.json({success: true, sells})
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
