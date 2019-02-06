const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { deleteAll, checkResponse, checkUser, checkHat } = require('./utils')
const { seedUsers } = require('../db/seeders')
const { User } = require('../db')
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

      prevUser.amountSpent.should.be.gte(thisUser.amountSpent, 'Users are not sorted by amountSpent')
    }
  })

  it('GET /users/paginated?page=1 should return the same as without the parameter', async () => {
    await seedUsers()

    const resWithoutParam = await chai.request(app).get('/users/paginated')
    const resWithParam = await chai.request(app).get('/users/paginated?page=1')

    resWithoutParam.body.should.deep.eql(resWithParam.body)
  })

  it('GET /users/paginated should contain the total number of pages', async () => {
    await seedUsers()

    const res = await chai.request(app).get('/users/paginated')

    res.body.should.include.keys('totalPages')
    res.body.totalPages.should.eql(3)

  })

  it('GET /users/paginated should have 0 total pages if there are no users', async () => {
    const res = await chai.request(app).get('/users/paginated')

    res.body.should.include.keys('totalPages')
    res.body.totalPages.should.eql(0)

  })

  it('GET /users/paginated should have 1 total pages if there is even 1 user', async () => {
    await User.create({email: 'test@example.com', hats: []})
    const res = await chai.request(app).get('/users/paginated')

    res.body.should.include.keys('totalPages')
    res.body.totalPages.should.eql(1)

  })

  it('GET /users/paginated?page=2 should return different users as ?page=1', async () => {
    await seedUsers()

    const resPage1 = await chai.request(app).get('/users/paginated?page=1')
    const resPage2 = await chai.request(app).get('/users/paginated?page=2')

    const idsPage1 = resPage1.body.users.map(user => user._id)
    const idsPage2 = resPage2.body.users.map(user => user._id)

    idsPage1.should.not.have.members(idsPage2)
  })

  it('GET /users/paginated?page=2 should return 50 users', async () => {
    await seedUsers()

    const res = await chai.request(app).get('/users/paginated?page=2')

    checkResponse(res)
    res.body.users.should.have.lengthOf(50)
  })

  it('GET /users/paginated?page=3 should return 20 users', async () => {
    await seedUsers()

    const res = await chai.request(app).get('/users/paginated?page=3')

    checkResponse(res)
    res.body.users.should.have.lengthOf(20)
  })

  it('GET /users/paginated?page=4 should return an empty array', async () => {
    await seedUsers()

    const res = await chai.request(app).get('/users/paginated?page=4')

    checkResponse(res)
    res.body.users.should.have.lengthOf(0)
  })

  it('GET /users/paginated?page=2 first user should have spent less than last user of page 1', async () => {
    await seedUsers()

    const resPage1 = await chai.request(app).get('/users/paginated?page=1')
    const resPage2 = await chai.request(app).get('/users/paginated?page=2')

    const users1 = resPage1.body.users
    const lastSpentPage1 = users1[users1.length - 1].amountSpent
    const firstSpentPage2 = resPage2.body.users[0].amountSpent

    lastSpentPage1.should.be.gte(firstSpentPage2)

  })

})
