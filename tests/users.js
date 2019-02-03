const chai = require('chai')
const chaiHttp = require('chai-http')
const { app, server } = require('../main')
chai.should()
chai.use(chaiHttp)

describe('User routes', () => {

  after(done => server.close(done))

  it('GET / should return an array', async () => {
    const res = await chai.request(app).get('/users')
    
    res.should.have.status(200)
    res.should.be.json
    res.body.should.be.an('object')
    res.body.success.should.eql(true)
    res.body.users.should.be.an('array')
    res.body.users.length.should.eql(0)
    console.log('here')
  })
})

