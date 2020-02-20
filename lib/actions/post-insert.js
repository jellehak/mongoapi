/**
 * Route action for getting all databases names
 */

const Adj = require('ajv')
const validator = new Adj()
const connection = require('../helpers/connection')
const onError = require('../helpers/pass-error')
const getSchemaForRequest = require('../helpers/request-schema')

module.exports = (request, response, config) => {
  const insertData = Array.isArray(request.body) ? request.body[0] : request.body

  if (!request.body) {
    response.json([])
    return
  }

  const schema = getSchemaForRequest(request, config)
  const isValid = !schema || validator.validate(schema, insertData)

  if (!isValid) {
    return response.status(400).json({ message: 'Document does not match predefined schema' })
  }

  connection.connectPromise(request.dbUri)
    .then(
      db => db.collection(request.params.collection),
      error => onError('Db open error: ', error))
    .then(
      collection => collection.insertOne(insertData),
      error => onError('Error getting collection: ', error))
    .then(
      result => response.onDone(result.ops[0], 201),
      error => onError('Error inserting into collection: ', error))
    .catch(error => response.onError('', error))
}
