const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const mongoose = require('mongoose')
const { deleteAll, addTestUsers, addTestSell, checkResponse } = require('./utils')
const should = chai.should()
chai.use(chaiHttp)

describe('Sell routes', () => {

  beforeEach(async () => {
    await deleteAll()
  })

  it('GET / should return a list of sells', async () => {
    const res = await chai.request(app).get('/sells')

    checkResponse(res)

    res.body.sells.should.be.an('array')
  })

})
