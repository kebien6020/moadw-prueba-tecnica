const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { deleteAll, checkResponse, checkUser, checkHat } = require('./utils')
const { seedUsers } = require('../db/seeders')
const { User } = require('../db')
const mongoose = require('mongoose')
const { refreshRecommendations } = require('../routes/users')
const fs = require('fs')
chai.should()
chai.use(chaiHttp)

describe('User routes', () => {

  beforeEach(async () => {
    await deleteAll()
  })

  describe('GET /users', () => {

    it('should return an empty array if there is no users', async () => {
      const res = await chai.request(app).get('/users')

      checkResponse(res)
      res.body.users.should.be.an('array')
      res.body.users.length.should.eql(0)

    })

    it('should return an array with all users', async () => {
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

  })

  describe('GET /users/paginated', () => {

    it('should return the first 50 users, sorted by money spent', async() => {
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

    it('?page=1 should return the same as without the parameter', async () => {
      await seedUsers()

      const resWithoutParam = await chai.request(app).get('/users/paginated')
      const resWithParam = await chai.request(app).get('/users/paginated?page=1')

      resWithoutParam.body.should.deep.eql(resWithParam.body)
    })

    it('should contain the total number of pages', async () => {
      await seedUsers()

      const res = await chai.request(app).get('/users/paginated')

      res.body.should.include.keys('totalPages')
      res.body.totalPages.should.eql(3)

    })

    it('should have 0 total pages if there are no users', async () => {
      const res = await chai.request(app).get('/users/paginated')

      res.body.should.include.keys('totalPages')
      res.body.totalPages.should.eql(0)

    })

    it('should have 1 total pages if there is even 1 user', async () => {
      await User.create({
        _id: new mongoose.Types.ObjectId().toString(),
        email: 'test@example.com',
        hats: [],
      })
      const res = await chai.request(app).get('/users/paginated')

      res.body.should.include.keys('totalPages')
      res.body.totalPages.should.eql(1)

    })

    it('?page=2 should return different users as ?page=1', async () => {
      await seedUsers()

      const resPage1 = await chai.request(app).get('/users/paginated?page=1')
      const resPage2 = await chai.request(app).get('/users/paginated?page=2')

      const idsPage1 = resPage1.body.users.map(user => user._id)
      const idsPage2 = resPage2.body.users.map(user => user._id)

      idsPage1.should.not.have.members(idsPage2)
    })

    it('?page=2 should return 50 users', async () => {
      await seedUsers()

      const res = await chai.request(app).get('/users/paginated?page=2')

      checkResponse(res)
      res.body.users.should.have.lengthOf(50)
    })

    it('?page=3 should return 20 users', async () => {
      await seedUsers()

      const res = await chai.request(app).get('/users/paginated?page=3')

      checkResponse(res)
      res.body.users.should.have.lengthOf(20)
    })

    it('?page=4 should return an empty array', async () => {
      await seedUsers()

      const res = await chai.request(app).get('/users/paginated?page=4')

      checkResponse(res)
      res.body.users.should.have.lengthOf(0)
    })

    it('?page=2 first user should have spent less than last user of page 1', async () => {
      await seedUsers()

      const resPage1 = await chai.request(app).get('/users/paginated?page=1')
      const resPage2 = await chai.request(app).get('/users/paginated?page=2')

      const users1 = resPage1.body.users
      const lastSpentPage1 = users1[users1.length - 1].amountSpent
      const firstSpentPage2 = resPage2.body.users[0].amountSpent

      lastSpentPage1.should.be.gte(firstSpentPage2)

    })

    it('first user should not have amountSpent of 0', async () => {
      await seedUsers()

      const res = await chai.request(app).get('/users/paginated')

      checkResponse(res)
      res.body.users[0].amountSpent.should.be.above(0)
    })

    it('?page=hello should return an invalid_parameter error', async () => {
      const res = await chai.request(app).get('/users/paginated?page=hello')

      checkResponse(res, 400, false) // 400 bad request
      res.body.error.should.be.an('object')

      const error = res.body.error
      error.should.include.keys('code', 'message')
      error.code.should.eql('invalid_parameter')
      error.message.should.eql('page should be a positive integer')
    })

    it('?page=1.5 should return an invalid_parameter error', async () => {
      const res = await chai.request(app).get('/users/paginated?page=1.5')

      checkResponse(res, 400, false) // 400 bad request
      res.body.error.should.be.an('object')

      const error = res.body.error
      error.should.include.keys('code', 'message')
      error.code.should.eql('invalid_parameter')
      error.message.should.eql('page should be a positive integer')
    })

    it('?page=0 should return an invalid_parameter error', async () => {
      const res = await chai.request(app).get('/users/paginated?page=0')

      checkResponse(res, 400, false) // 400 bad request
      res.body.error.should.be.an('object')

      const error = res.body.error
      error.should.include.keys('code', 'message')
      error.code.should.eql('invalid_parameter')
      error.message.should.eql('page should be greater than 0')
    })

    it('?page=-1 should return an invalid_parameter error', async () => {
      const res = await chai.request(app).get('/users/paginated?page=-1')

      checkResponse(res, 400, false) // 400 bad request
      res.body.error.should.be.an('object')

      const error = res.body.error
      error.should.include.keys('code', 'message')
      error.code.should.eql('invalid_parameter')
      error.message.should.eql('page should be greater than 0')
    })

    it('?minSpent=10 should return only users with amountSpent >= 10', async () => {
      await seedUsers()

      const initialRes = await chai.request(app).get('/users/paginated?minSpent=10')
      const lastPage = initialRes.body.totalPages

      const url = `/users/paginated?minSpent=10&page=${lastPage}`
      const res = await chai.request(app).get(url)

      checkResponse(res)
      res.body.users.should.be.an('array')

      const users = res.body.users
      users.should.not.have.lengthOf(0)
      users.forEach(user => {
        user.amountSpent.should.be.at.least(10)
      })
    })

    it('?maxSpent=500 should return only users with amountSpent <= 500', async () => {
      await seedUsers()

      const url = '/users/paginated?maxSpent=500'
      const res = await chai.request(app).get(url)

      checkResponse(res)
      res.body.users.should.be.an('array')

      const users = res.body.users
      users.should.not.have.lengthOf(0)
      users.forEach(user => {
        user.amountSpent.should.be.at.most(500)
      })
    })

    it('minSpent and maxSpent should be able to be combined', async () => {
      await seedUsers()

      const baseUrl = '/users/paginated?minSpent=10&maxSpent=500'
      const initialRes = await chai.request(app).get(baseUrl)
      checkResponse(initialRes)

      let returnedUsers = initialRes.body.users

      const totalPages = initialRes.body.totalPages
      for (let page = 2; page <= totalPages; ++page) {
        const res = await chai.request(app).get(`${baseUrl}&page=${page}`)
        checkResponse(res)
        returnedUsers = returnedUsers.concat(res.body.users)
      }

      returnedUsers.should.not.have.lengthOf(0)
      returnedUsers.forEach(user => {
        user.amountSpent.should.be.at.least(10)
        user.amountSpent.should.be.at.most(500)
      })
    })

    it('negative minSpent and maxSpent should not cause troubles', async () => {
      await seedUsers()

      const urlMin = '/users/paginated?minSpent=-10'
      const urlMax = '/users/paginated?maxSpent=-10'
      const resMin = await chai.request(app).get(urlMin)
      const resMax = await chai.request(app).get(urlMax)

      checkResponse(resMin)
      checkResponse(resMax)

      resMin.body.users.should.be.an('array')
      resMax.body.users.should.be.an('array')

      resMin.body.users.should.have.lengthOf(50)
      resMax.body.users.should.have.lengthOf(0)
    })

    it('string minSpent and maxSpent should error with code invalid_parameter', async () => {
      await seedUsers()

      const urlMin = '/users/paginated?minSpent=hello'
      const urlMax = '/users/paginated?maxSpent=world'
      const resMin = await chai.request(app).get(urlMin)
      const resMax = await chai.request(app).get(urlMax)

      checkResponse(resMin, 400, false)
      checkResponse(resMax, 400, false)

      resMin.body.error.code.should.eql('invalid_parameter')
      resMax.body.error.code.should.eql('invalid_parameter')

      resMin.body.error.message.should.eql('minSpent should be a number')
      resMax.body.error.message.should.eql('maxSpent should be a number')
    })

  })

  describe('GET /users/recommendations', () => {

    it('should get an array with users', async () => {
      const res = await chai.request(app).get('/users/recommendations')

      checkResponse(res)
      res.body.users.should.be.an('array')

    })

    it('should show users with their recommendations', async () => {
      await seedUsers()
      await refreshRecommendations()

      const res = await chai.request(app).get('/users/recommendations')

      checkResponse(res)
      res.body.users.should.be.an('array')
      res.body.users.should.have.lengthOf(50)

      res.body.users.forEach(user => {
        user.should.include.keys('recommendedHats', 'email')

        user.email.should.be.a('string')
        user.recommendedHats.should.be.an('array')
        user.recommendedHats.should.not.have.lengthOf(0)

        user.recommendedHats.forEach(hat => {
          checkHat(hat)
        })
      })

    }).timeout(10000)

  })

  describe('GET /users/recommendations/save', () => {

    it('should save to a JSON file the same as /users/recommendations', async () => {
      await seedUsers()
      await refreshRecommendations()

      for (let page = 1; page <= 3; ++page) {
        const url1 = `/users/recommendations?page=${page}`
        const url2 = `/users/recommendations/save?page=${page}`

        const res1 = await chai.request(app).get(url1)
        const res2 = await chai.request(app).get(url2)

        checkResponse(res1)
        checkResponse(res2)

        const filename = `storage/recommendations-page-${page}.json`
        const fileText = fs.readFileSync(filename, {encoding: 'utf8'})
        const fileObj = JSON.parse(fileText)

        res1.body.should.deep.eql(fileObj)

      }

    }).timeout(10000)

  })

})
