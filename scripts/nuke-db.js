const { User, db } = require('../db')

async function main() {
  await User.deleteMany({})
  db.close()
}

main()
