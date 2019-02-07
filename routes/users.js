const { User, Hat, Recommendation } = require('../db')
const { InvalidParameterError } = require('../errors/errorClasses')
const debug = require('debug')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Lists all users with their hats
// Use for debugging purposes
async function listAll(req, res, _next) {
  const users = await User.find({}, '-__v').populate('hats', '-__v').populate('recommendedHats')
  res.json({success: true, users})
}

function isNumeric(str) {
  return !isNaN(Number(str))
}


function checkNatural(str, paramName) {
  // Avoid strings, negative numbers and decimals
  if (str !== undefined) {
    const notNumeric = !isNumeric(str)
    const notInteger = Math.floor(Number(str)) !== Number(str)
    const notPositive = Number(str) <= 0
    if (notNumeric || notInteger) {
      throw new InvalidParameterError(`${paramName} should be a positive integer`)
    } else if (notPositive) {
      throw new InvalidParameterError(`${paramName} should be greater than 0`)
    } else {
      return true
    }
  }
  return false
}

function checkNumber(str, paramName) {
  if (str !== undefined) {
    const notNumeric = !isNumeric(str)
    if (notNumeric) {
      throw new InvalidParameterError(`${paramName} should be a number`)
    } else {
      return true
    }
  }
  return false
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


    if (checkNatural(pageRaw, 'page')) page = Number(pageRaw)
    // For minSpent and maxSpent decimals and negative values can be allowed.
    // Negative values do not make sense but they don't cause trouble
    if (checkNumber(minSpentRaw, 'minSpent')) minSpent = Number(minSpentRaw)
    if (checkNumber(maxSpentRaw, 'maxSpent')) maxSpent = Number(maxSpentRaw)

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

async function recommendToUser(user, allHats, algoConfig) {
  const avgOwnedPrice =
    user.hats.length === 0 ? null :
      user.hats.reduce((acc, hat) => acc + hat.price, 0) / user.hats.length

  // Score every single hat for this user, based on his current hats
  const userHats = user.hats.map(hat => hat._id)
  let scoredHats = allHats
    .map(hat => hat.toObject()) // clone and convert to plain object
    // do not take into account the hats the user already has
    .filter(hat => userHats.indexOf(hat._id) === -1)
  for (const hat of scoredHats) {
    const materialScore = user.hats.reduce((acc, userHat) =>
      hat.material === userHat.material ?
        acc + algoConfig.sameMaterialBonus :
        acc
    , 0)
    // Calculate price deviation from user average
    const priceDeviation =
      avgOwnedPrice === null ? 0 :
        Math.abs(avgOwnedPrice - hat.price) / avgOwnedPrice
    const priceScore = priceDeviation * -algoConfig.priceDeviationPenality

    hat.score = algoConfig.baseScore + materialScore + priceScore
  }
  // sort hats by score in descending order
  scoredHats.sort((hatA, hatB) => hatB.price - hatA.price)
  // pick top 3
  scoredHats = scoredHats.slice(0, 3)
  // add _id to save in db
  scoredHats = scoredHats.map(hat => Object.assign(hat, {
    _id: new mongoose.Types.ObjectId().toString()
  }))

  const userObj = user.toObject()
  userObj.recommendedHats = scoredHats

  // save recommendations to db
  await Recommendation.insertMany(scoredHats)
  // save user to db
  await User.updateOne({_id: user._id}, userObj)

  scoredHats = null
}

async function refreshRecommendations() {
  const log = debug('app:commands')
  log('Recalculating all recommendations')

  // Configuration varaiables for the algorithm
  // 30 initial points
  const baseScore = 30
  // 10 points for every hat of the same material that the user owns
  const sameMaterialBonus = 10
  // -10 point for every 100% of deviation
  const priceDeviationPenality = 10


  // Wipe all previous recommendations
  await User.updateMany({}, { $set: {recommendedHats: []}})
  await Recommendation.deleteMany({})

  const allUsers = await User.find({}).populate('hats')
  const allHats = await Hat.find({})

  for (const user of allUsers) {
    // Run recommendation algorithm for every user
    // The querys to the db run in parallel
    await recommendToUser(user, allHats, {
      baseScore,
      sameMaterialBonus,
      priceDeviationPenality,
    })
  }

  log('Finished saving recommendations to the db')
}

async function refreshRecommendationsEndpoint(_req, res, next) {
  try {
    await refreshRecommendations()

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

async function getRecommendationsPaged(pageStr) {
  // For this endpoint users are paginated every 50 entries, the number
  // is fixed in the spec, but it can be changed here if it's needed
  const pageSize = 50

  // By default assume page as 1, even if not provided in the URL
  let page = 1

  // Validation: If everything is fine with the query parameter, use
  // that as the page number, otherwise ignore it
  const pageRaw = pageStr
  if (checkNatural(pageRaw)) page = Number(pageRaw)

  const users = await User
    .find({}, '-__v')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('recommendedHats', '-__v')

  // Total user count can't be retrieved in the previous query
  const userCount = await User.countDocuments({})
  const totalPages = Math.ceil(userCount / pageSize)

  return { users, totalPages, page }
}

async function listRecommendations(req, res, next) {
  try {

    const {users, totalPages} = await getRecommendationsPaged(req.query.page)

    res.json({success: true, users, totalPages})
  } catch (e) {
    next(e)
  }
}

async function saveRecommendationsAsJson(req, res, next) {
  try {
    const {users, totalPages, page} = await getRecommendationsPaged(req.query.page)

    const objToSave = {success: true, users, totalPages}
    // Pretty-print JSON with 4 space indentation
    const strToSave = JSON.stringify(objToSave, null, 4)

    const filename = `recommendations-page-${page}.json`
    const filepath = path.resolve(__dirname, '../storage', filename)

    fs.writeFile(filepath, strToSave, {encoding: 'utf8'}, err => {
      if (err) throw err

      res.json({success: true})
    })


  } catch (e) {
    next(e)
  }

}

module.exports = {
  listAll,
  paginated,
  refreshRecommendations,
  refreshRecommendationsEndpoint,
  listRecommendations,
  saveRecommendationsAsJson,
}
