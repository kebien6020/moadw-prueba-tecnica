const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { deleteAll, checkResponse } = require('./utils')
chai.should()
chai.use(chaiHttp)

describe('User routes', () => {

  beforeEach(async () => {
    await deleteAll()
  })

  it('GET /users should return an empty array if there is no users', async () => {
    const res = await chai.request(app).get('/users')

    checkResponse(res)
    res.body.users.should.be.an('array')
    res.body.users.length.should.eql(0)
    
  })

})
