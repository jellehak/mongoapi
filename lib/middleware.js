/**
 * Sort of middlewares, that have access to route params
 */

const endpoint = require('./helpers/endpoint')

// Set db uri custom param
const setDbUri = config => (request, response, next) => {
  request.dbUri = config.db // config.baseDbUri

  // if (request.params.db) {
  //   request.dbUri += '/' + request.params.db
  // }

  next()
}

// Check if user can access db and collection
const checkDBAceess = config => (request, response, next) => {
  const allowed = config.dbAccessControl
  // const skip = typeof allowed === 'undefined'
  // if (skip) return true

  var allow = true
  const db = request.params.db
  const collection = request.params.collection
  const isDbEndpoint = endpoint.isDbEndpoint(config)

  if (isDbEndpoint) {
    allow = typeof collection === 'undefined' || !allowed.length || allowed.indexOf(collection) > -1
  } else if (db) {
    const allowedCollections = allowed[db]

    allow = typeof allowedCollections !== 'undefined' &&
      (typeof collection === 'undefined' ||
        !allowedCollections.length ||
        allowedCollections.indexOf(collection) > -1)
  }

  if (!allow) {
    response.status(403)
    response.json('Access to db is not allowed')
  }

  if(allow) {
    next()
  }
}

module.exports = {
  setDbUri,
  checkDBAceess
}
