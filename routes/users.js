const express = require('express')
const { Router } = express
const { User } = require('../db')

// We accept the router as a parameter in case we wanted to mock it
// This is dependency injection
module.exports = (router = new Router()) => {

  router.get('/', async (req, res, _next) => {
    const users = await User.find({}, '-__v').populate('hats', '-__v')
    res.json({success: true, users})
  })

  router.get('/paginated', async (req, res, next) => {
    try {
      // For this endpoint users are paginated every 50 entries, the number
      // is fixed in the spec, but it can be changed here if it's needed
      const pageSize = 50

      // By default assume page as 1, even if not provided in the URL
      let page = 1

      // Validation: If everything is fine with the query parameter, use
      // that as the page number, otherwise ignore it
      const pageRaw = req.query.page
      const isNumeric = str => !isNaN(Number(str))
      if (isNumeric(pageRaw)) {
        // Avoid negative numbers and decimals in the page
        page = Math.abs(Math.floor(Number(pageRaw)))
      }

      // We could request all the users from the database and then
      // do the filtering, sorting and pagination in js, but it is
      // more efficient to do a query that does all of that.
      // MongoDB aggregates are the perfect tool for such complicated querys.
      const users = await User.aggregate([
        {
          $lookup: {
            from: 'hats',
            localField: 'hats',
            foreignField: '_id',
            as: 'hat_array'
          }
        },
        {
          // Add amountSpent field which contains the sum of the price of
          // all hats for this user
          $addFields: {
            amountSpent: {
              // equivalent to
              // currentUser.hats.reduce((acc, hat) => acc + hat.price, 0)
              $reduce: {
                input: '$hat_array',
                initialValue: 0,
                in: {$add : ['$$value', '$$this.price']}
              }
            }
          }
        },
        // Include only _id, email and amountSpent
        { $project: { _id: 1, email: 1, amountSpent: 1 } },

        // Sort and pagination
        { $sort: { amountSpent: -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize, }
      ])

      // Total user count can't be retrieved in the previous query
      const userCount = await User.countDocuments()
      const totalPages = Math.ceil(userCount / pageSize)

      res.json({success: true, users, totalPages})
    } catch (e) {
      next(e)
    }
  })

  return router

}
