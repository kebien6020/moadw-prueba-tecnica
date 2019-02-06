const { User } = require('../db')

exports.deleteAll = async function () {
  await User.deleteMany({})
}

exports.addTestUsers = async function () {
  const inserted = await User.insertMany([
    { email: 'jhon.doe@example.com', hats: []},
    { email: 'psmith@test.com', hats: []},
  ])
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
  user.should.have.keys('email', 'hats', '_id')
  user.should.not.have.any.keys('__v')

  user.email.should.be.a('string')
  user.hats.shoud.be.an('array')
  user._id.should.be.an('string')
}
