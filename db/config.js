
module.exports = (env = process.env.NODE_ENV) => {
  return {
    development: {
      db: {
        connection: 'mongodb://localhost:27017/db-moadw-dev',
      },
    },
    test: {
      db: {
        connection: 'mongodb://localhost:27017/db-moadw-test',
      },
    },
    production: {
      db: {
        connection: 'mongodb+srv://root:O7DgnKqSqCFmvC6n@tests-0eeni.mongodb.net/test',
      },
    },
  }[env || 'development']
}
