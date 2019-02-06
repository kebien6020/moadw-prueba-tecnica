class BaseError extends Error {
  constructor(message) {
    super(message)
    this.code = 'unknown'
    this.statusCode = 500
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    }
  }
}

class InvalidParameterError extends BaseError {
  constructor(message) {
    super(message)
    this.code = 'invalid_parameter'
    this.statusCode = 400
    this.message = message
  }
}

module.exports = {
  BaseError,
  InvalidParameterError,
}
