const { User, Hat, db } = require('../db')

async function main() {
  await User.deleteMany({})
  await Hat.deleteMany({})
  db.close()
}

main()
