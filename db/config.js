
module.exports = (env = process.env.NODE_ENV) => {
  return {
    development: {
      db: {
        connection: 'mongodb://localhost:27017/db-dev',
      },
    },
    test: {
      db: {
        connection: 'mongodb://localhost:27017/db-test',
      },
    },
  }[env || 'development']
}
