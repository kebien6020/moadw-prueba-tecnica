const faker = require('faker')
const randomNumber = require('random-number')
const { User } = require('../db')

function seedUsers() {
  // Generate 120 users with fake data
  const users = []
  const rand = randomNumber.generator({min: 0, max: 10, integer: true})
  for (let i = 0; i < 120; ++i) {
    // Generate from 1 to 10 hats
    const hats = Array(rand()).fill('').map(() => {
      return {
        name: faker.commerce.productName(),
        price: Number(faker.commerce.price()),
        material: faker.commerce.productMaterial(),
      }
    })
    const user = {
      email: faker.internet.email(),
      hats: hats,
    }
    users.push(user)
  }
  // Actually save them in the database
  return User.insertMany(users)
}

async function seed() {
  await seedUsers()
}

module.exports = {
  seedUsers,
  seed,
}
