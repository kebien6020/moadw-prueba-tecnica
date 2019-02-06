const faker = require('faker')
const randomNumber = require('random-number')
const { User, Hat } = require('../db')
const mongoose = require('mongoose')

async function seedUsers() {
  // Generate 120 users with fake data
  const users = []
  let allHats = []
  const rand = randomNumber.generator({min: 0, max: 10, integer: true})
  for (let i = 0; i < 120; ++i) {
    // Generate from 1 to 10 hats
    const hats = Array(rand()).fill('').map(() => {
      return {
        _id: new mongoose.Types.ObjectId().toString(),
        name: faker.commerce.productName(),
        price: Number(faker.commerce.price()),
        material: faker.commerce.productMaterial(),
      }
    })
    const user = {
      _id: new mongoose.Types.ObjectId().toString(),
      email: faker.internet.email(),
      hats: hats.map(hat => hat._id)
    }

    allHats = allHats.concat(hats)
    users.push(user)
  }

  await Hat.insertMany(allHats)
  await User.insertMany(users)
}

async function seed() {
  await seedUsers()
}

module.exports = {
  seedUsers,
  seed,
}
