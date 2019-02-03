const express = require('express')
const { Router } = express
const { User } = require('../db')
const mongoose = require('mongoose')

module.exports = (router  = new Router()) => {

  router.get('/', async (req, res, next) => {
    const users = await User.find()
    res.json({success: true, users})
  })

  router.get('/:id', async (req, res, next) => {
    const pipeline = [
      { $match: {_id: mongoose.Types.ObjectId(req.params.id)} },
    ]

    if (req.query.includeSells === 'true') {
      pipeline.push({
        $lookup: {
          from: 'sells',
          localField: '_id',
          foreignField: 'userId',
          as: 'sells',
        },
      })
    }

    const results = await User.aggregate(pipeline)
    if (results[0]) {
      const user = results[0]
      res.json({success:true, user})
    }
  })

  return router

}
