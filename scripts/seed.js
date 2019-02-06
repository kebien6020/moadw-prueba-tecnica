const { seed } = require('../db/seeders')
const { db } = require('../db')

async function main() {
  await seed()
  db.close()
}

main()
