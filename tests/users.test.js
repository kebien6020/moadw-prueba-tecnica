const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { deleteAll, checkResponse, checkUser, checkHat } = require('./utils')
const { seedUsers } = require('../db/seeders')
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

  it('GET /users should return an array with all users', async () => {
    await seedUsers()

    const res = await chai.request(app).get('/users')

    checkResponse(res)
    res.body.users.should.be.an('array')
    res.body.users.should.not.have.lengthOf(0)

    res.body.users.forEach(user => {
      checkUser(user)
      user.hats.forEach(checkHat)
    })
  })

  it('GET /users/paginated should return the first 50 users, sorted by money spent', async() => {
    await seedUsers()

    const res = await chai.request(app).get('/users/paginated')

    checkResponse(res)
    res.body.users.should.be.an('array')
    res.body.users.should.have.lengthOf(50)

    res.body.users.forEach(user => {
      user.should.have.keys('email', 'amountSpent', '_id')

      user.email.should.be.a('string')
      user.amountSpent.should.be.a('number')
      user._id.should.be.a('string')
    })

    // Check that the amount spent is in descending order
    // NOTE: Loop intentionally starts from 1 instead of 0
    const users = res.body.users
    for (let i = 1; i < users.length; ++i) {
      const prevUser = users[i - 1]
      const thisUser = users[i]

      prevUser.amountSpent.should.be.above(thisUser.amountSpent, 'Users are not sorted by amountSpent')
    }
  })

  it('GET /users/paginated?page=1 should return the same as without the parameter', async () => {
    await seedUsers()

    const resWithoutParam = await chai.request(app).get('/users/paginated')
    const resWithParam = await chai.request(app).get('/users/paginated?page=1')

    resWithoutParam.body.should.deep.eql(resWithParam.body)
  })

})
