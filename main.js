const express = require('express')
const mongoose = require('mongoose')

const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 8100

app.use(routes())

module.exports = app // For testing
