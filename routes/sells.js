const express = require('express')
const { Router } = express
const { Sell } = require('../db')

module.exports = (router  = new Router()) => {

  router.get('/', async (req, res, next) => {
    const sells = await Sell.find({}, '-__v')
    res.json({success: true, sells})
  })

  return router

}
