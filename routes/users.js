const express = require('express')
const { Router } = express
const { User } = require('../db')

module.exports = (router  = new Router()) => {

  router.get('/', async (req, res, _next) => {
    const users = await User.find({}, '-__v')
    res.json({success: true, users})
  })

  router.get('/paginated', async (req, res, next) => {
    try {
      const users = await User.aggregate([
        {
          // Add amountSpent field which contains the sum of the price of
          // all hats for this user
          $addFields: {
            amountSpent: {
              // equivalent to
              // currentUser.hats.reduce((acc, hat) => acc + hat.price, 0)
              $reduce: {
                input: '$hats',
                initialValue: 0,
                in: {$add : ['$$value', '$$this.price']}
              }
            }
          }
        },
        // Include only _id, email and amountSpent
        { $project: { _id: 1, email: 1, amountSpent: 1 } },
        { $sort: { amountSpent: -1 } },
        { $limit: 50, }
      ])
      res.json({success: true, users})
    } catch (e) {
      next(e)
    }
  })

  return router

}
