const express = require('express')
const { Router } = express

const users = require('./users')
const sells = require('./sells')

module.exports = (router = new Router()) => {

  router.get('/', (req, res, _next) => {
    res.json({success: true})
  })

  router.use('/users', users())
  router.use('/sells', sells())

  return router

}
