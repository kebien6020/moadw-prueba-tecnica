const express = require('express')
const { User, Sell } = require('./db')
const mongoose = require('mongoose')

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
  const result = await User.aggregate([
    { $match: {_id: mongoose.Types.ObjectId(req.params.id)} },
    {
      $lookup: {
        from: 'sells',
        localField: '_id',
        foreignField: 'userId',
        as: 'sells',
      },
    }
  ])
  if (result[0]) {
    const user = result[0]
    res.json({success:true, user})
  }
})

app.get('/sells', async (req, res, next) => {
  const sells = await Sell.find()
  res.json({success: true, sells})
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
