const express = require('express')
const { Router } = express
const users = require('./users')

const router = new Router()

// By calling this route you can verify connection with the
// server from your app
router.get('/', (req, res, _next) => {
  res.json({success: true})
})

router.get('/users/', users.listAll)
router.get('/users/paginated', users.paginated)
router.get('/users/refreshRecommendations', users.refreshRecommendationsEndpoint)
router.get('/users/recommendations', users.listRecommendations)

module.exports = router
