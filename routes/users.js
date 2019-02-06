const { User } = require('../db')
const { InvalidParameterError } = require('../errors/errorClasses')

// Lists all users with their hats
// Use for debugging purposes
async function listAll(req, res, _next) {
  const users = await User.find({}, '-__v').populate('hats', '-__v')
  res.json({success: true, users})
}

// List users with their amount spent on hats, sorted by this amount in
// decreasing order, paginated every 50 users
async function paginated(req, res, next) {
  try {
    // For this endpoint users are paginated every 50 entries, the number
    // is fixed in the spec, but it can be changed here if it's needed
    const pageSize = 50

    // By default assume page as 1, even if not provided in the URL
    let page = 1
    let minSpent = -Infinity
    let maxSpent = Infinity

    // Validation: If everything is fine with the query parameter, use
    // that as the page number, otherwise ignore it
    const pageRaw = req.query.page
    const minSpentRaw = req.query.minSpent
    const maxSpentRaw = req.query.maxSpent
    const isNumeric = str => !isNaN(Number(str))


    // Avoid strings, negative numbers and decimals in the page
    if (pageRaw !== undefined) {
      const notNumeric = !isNumeric(pageRaw)
      const notInteger = Math.floor(Number(pageRaw)) !== Number(pageRaw)
      const notPositive = Number(pageRaw) <= 0
      if (notNumeric || notInteger) {
        throw new InvalidParameterError('page should be a positive integer')
      } else if (notPositive) {
        throw new InvalidParameterError('page should be greater than 0')
      } else {
        page = Number(pageRaw)
      }
    }

    // For minSpent and maxSpent decimals and negative values can be allowed.
    // Negative values do not make sense but they don't cause trouble
    if (minSpentRaw !== undefined) {
      const notNumeric = !isNumeric(minSpentRaw)
      if (notNumeric) {
        throw new InvalidParameterError('minSpent should be a number')
      } else {
        minSpent = Number(minSpentRaw)
      }
    }
    if (maxSpentRaw !== undefined) {
      const notNumeric = !isNumeric(maxSpentRaw)
      if (notNumeric) {
        throw new InvalidParameterError('maxSpent should be a number')
      } else {
        maxSpent = Number(maxSpentRaw)
      }
    }


    // We could request all the users from the database and then
    // do the filtering, sorting and pagination in js, but it is
    // more efficient to do a query that does all of that.
    // MongoDB aggregates are the perfect tool for such complicated querys.
    const lookupStage = {
      $lookup: {
        from: 'hats',
        localField: 'hats',
        foreignField: '_id',
        as: 'hat_array'
      }
    }
    const addAmountSpentStage = {
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
    }
    const filterStage = {
      $match: { amountSpent: { $gte: minSpent, $lte: maxSpent } }
    }
    const users = await User.aggregate([
      lookupStage,
      addAmountSpentStage,
      // Filter as early as possible for eficiency
      filterStage,
      // Include only _id, email and amountSpent
      { $project: { _id: 1, email: 1, amountSpent: 1 } },
      // Sort and pagination
      { $sort: { amountSpent: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize, }
    ])

    // Total user count can't be retrieved in the previous query
    const countResult = await User.aggregate([
      lookupStage,
      addAmountSpentStage,
      filterStage,
      { $count: 'count' },
    ])
    const userCount = countResult[0] ? countResult[0].count : 0
    const totalPages = Math.ceil(userCount / pageSize)

    res.json({success: true, users, totalPages})
  } catch (e) {
    next(e)
  }
}

module.exports = {
  listAll,
  paginated,
}
