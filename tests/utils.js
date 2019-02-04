const { User, Sell } = require('../db')

exports.deleteAll = async function () {
  await User.deleteMany({})
  await Sell.deleteMany({})
}

exports.addTestUsers = async function () {
  const inserted = await User.insertMany([
    { name: 'Jhon Doe', password: '123', role: 'basic' },
    { name: 'Paul Smith', password: '456', role: 'admin' },
  ])
  return inserted
}

exports.addTestSell = async function (userId) {
  const inserted = await Sell.create({
    product: 'Paca 360',
    value: '2500',
    qty: 3,
    userId: userId
  })
  return inserted
}

exports.checkResponse = function (res, statusCode = 200) {
  res.should.have.status(statusCode)
  res.should.be.json
  res.body.should.be.an('object')
  res.body.success.should.eql(true)
}

exports.checkUser = function (user) {
  user.should.be.an('object')
  user.should.have.keys('name', 'role', '_id')
  user.should.not.have.any.keys('password', '__v')

  user.name.should.be.a('string')
  user.role.should.be.oneOf(['basic', 'admin'])
  user._id.should.be.an('string')
}

