const express = require('express')
const { Router } = express
const { Sell } = require('../db')

module.exports = (router  = new Router()) => {

  router.get('/', async (req, res, next) => {
    const sells = await Sell.find()
    res.json({success: true, sells})
  })

  return router

}
