const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const mongoose = require('mongoose')
const { deleteAll, addTestUsers, addTestSell, checkResponse, checkSell } = require('./utils')
const should = chai.should()
chai.use(chaiHttp)

describe('Sell routes', () => {

  beforeEach(deleteAll)

  it('GET / should return a list of sells', async () => {
    const res = await chai.request(app).get('/sells')

    checkResponse(res)

    res.body.sells.should.be.an('array')
    res.body.sells.should.have.lengthOf(0)
  })

  it('GET / should return a sell if there is one', async () => {
    const users = await addTestUsers()
    await addTestSell(users[0].id)

    const res = await chai.request(app).get('/sells')

    checkResponse(res)

    res.body.sells.should.be.an('array')
    res.body.sells.should.have.lengthOf(1)

    const sell = res.body.sells[0]
    checkSell(sell)
  })

})
