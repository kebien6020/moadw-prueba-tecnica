const { BaseError } = require('./errorClasses')
const log = require('debug')('app:error')

function errorMiddleware(err, _req, res, _next) {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({success: false, error: err})
    return
  }

  // Unknown error, just send as-is with code 500, since this is not expected
  log(err)
  res.status(500).json({
    success: false,
    error: {message: err.message, code: 'internal_server_error'}
  })
}

module.exports = errorMiddleware
