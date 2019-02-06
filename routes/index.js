const express = require('express')
const { Router } = express

const users = require('./users')

module.exports = (router = new Router()) => {

  // By calling this route you can verify connection with the
  // server from your app
  router.get('/', (req, res, _next) => {
    res.json({success: true})
  })

  router.use('/users', users())

  return router

}
