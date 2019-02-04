const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { deleteAll, addTestUsers, addTestSell, checkResponse, checkUser } = require('./utils')
const should = chai.should()
chai.use(chaiHttp)

describe('User routes', () => {

  beforeEach(async () => {
    await deleteAll()
  })

  it('GET / should return an array', async () => {
    const res = await chai.request(app).get('/users')
    
    checkResponse(res)
    res.body.users.should.be.an('array')
    res.body.users.length.should.eql(0)
  })

  it('GET / should return users if they are in the db', async () => {
    await addTestUsers()

    const res = await chai.request(app).get('/users')

    checkResponse(res)
    res.body.users.should.be.an('array')
    const users = res.body.users
    users.should.have.lengthOf(2)
    users.forEach(checkUser)
  })

  it('GET /:id should return individual user', async () => {
    const inserted = await addTestUsers()
    const id = inserted[0]._id

    const res = await chai.request(app).get(`/users/${id}`)

    checkResponse(res)
    res.body.user.should.be.an('object')

    const user = res.body.user
    checkUser(user)
  })

  it('GET /:id with query param should yield user with sells', async () => {
    const inserted = await addTestUsers()
    const id = inserted[0]._id
    await addTestSell(id)

    const res = await chai.request(app).get(`/users/${id}?includeSells=true`)

    checkResponse(res)
    res.body.user.should.be.an('object')

    const user = res.body.user
    user.should.be.an('object')
    user.sells.should.be.an('array')
    user.sells.should.have.lengthOf(1)
    const sell = user.sells[0]
    sell.should.be.an('object')
    sell.should.have.all.keys('product', 'value', 'qty', 'userId', '_id')
    sell.should.not.have.any.keys('__v')
    
    ;['product', 'value', 'userId', '_id'].forEach(key => {
      sell[key].should.be.an('string')
    })
    sell.qty.should.be.a('number')
  })
})

