const chai = require('chai')
const chaiHttp = require('chai-http')
const { app, server } = require('../main')
const { User, Sell } = require('../db')
const should = chai.should()
chai.use(chaiHttp)

async function deleteAll() {
  await User.deleteMany({})
  await Sell.deleteMany({})
}

async function addTestUsers() {
  const inserted = await User.insertMany([
    { name: 'Jhon Doe', password: '123', role: 'basic' },
    { name: 'Paul Smith', password: '456', role: 'admin' },
  ])
  return inserted
}

async function addTestSell(userId) {
  const inserted = await Sell.create({
    product: 'Paca 360',
    value: '2500',
    qty: 3,
    userId: userId
  })
  return inserted
}


describe('User routes', () => {

  after(done => server.close(done))

  beforeEach(async () => {
    await deleteAll()
  })

  it('GET / should return an array', async () => {
    const res = await chai.request(app).get('/users')
    
    res.should.have.status(200)
    res.should.be.json
    res.body.should.be.an('object')
    res.body.success.should.eql(true)
    res.body.users.should.be.an('array')
    res.body.users.length.should.eql(0)
  })

  it('GET / should return users if they are in the db', async () => {
    await addTestUsers()

    const res = await chai.request(app).get('/users')

    res.should.have.status(200)
    res.should.be.an('object')
    res.body.success.should.be.true
    res.body.users.should.be.an('array')
    const users = res.body.users
    users.should.have.lengthOf(2)
    users.forEach(user => {
      user.should.be.an('object')
      user.should.have.keys('name', 'role', '_id')
      user.should.not.have.any.keys('password', '__v')

      user.name.should.be.a('string')
      user.role.should.be.oneOf(['basic', 'admin'])
      user._id.should.be.an('string')
    })
  })

  it('GET /:id should return individual user', async () => {
    const inserted = await addTestUsers()
    const id = inserted[0]._id

    const res = await chai.request(app).get(`/users/${id}`)

    res.should.have.status(200)
    res.should.be.an('object')
    res.body.success.should.be.true
    res.body.user.should.be.an('object')

    const user = res.body.user
    user.should.be.an('object')
    user.should.have.all.keys('name', 'role', '_id')
    user.should.not.have.any.keys('password', '__v')

    user.name.should.be.a('string')
    user.role.should.eql('basic')
    user._id.should.be.an('string')
  })

  it('GET /:id with query param should yield user with sells', async () => {
    const inserted = await addTestUsers()
    const id = inserted[0]._id
    await addTestSell(id)

    const res = await chai.request(app).get(`/users/${id}?includeSells=true`)

    res.should.have.status(200)
    res.should.be.an('object')
    res.body.success.should.be.true
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

