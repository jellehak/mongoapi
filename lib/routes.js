/**
 * Set REST API routes
 */

const auth = require('./auth/auth')
const endpoint = require('./helpers/endpoint')
const middleware = require('./middleware')

const deleteQuery = require(`./actions/delete-query`)
const getCollectionNames = require(`./actions/get-collection-names`)
const getDbNames = require(`./actions/get-db-names`)
const getQuery = require(`./actions/get-query`)
const patchUpdate = require(`./actions/patch-update`)
const postBulk = require(`./actions/post-bulk`)
const postInsert = require(`./actions/post-insert`)
const putUpdate = require(`./actions/put-update`)
const cors = require('cors')

module.exports = function (app, config) {
  // CORS
  app.options('*', cors())
  app.use(cors())

  if (config.auth) auth(app, config)

  // Middleware
  // app.set('config',config)
  // app.use(middleware.setResponseMethods)
  // app.use(middleware.setDbParamByEndpoint)
  app.use(middleware.setDbUri(config))
  app.use(middleware.checkDBAceess(config))

  // Injection TODO REMOVE
  app.use((req, res, next) => {
    res.onDone = (data, code) => {
      if (typeof code === 'undefined') code = 200
      if (typeof data === 'undefined') data = { ok: 1 }

      res.status(code).json(data)
    }
    next()
  })

  // app.use( (req, res) => {
  //   res.send(req.dbUri)
  // })
  // app.get('/', function (req, res) {
  //   throw new Error('BROKEN') // Express will catch this on its own.
  // })

  // Get all databases names
  // app.get('/dbs', getDbNames)
  app.get('/', (req, res) => {
    res.send('Welcome')
  })

  // Get names of all collections in specified database
  app.get('/', getCollectionNames)

  // Query
  app.get('/:collection/:id?', getQuery(config))

  // Bulk write operations
  // app.post('/bulk', postBulk)

  // Insert
  app.post('/:collection', postInsert)

  // Replace
  app.put('/:collection/:id', putUpdate)

  // Update
  app.patch('/:collection/:id', patchUpdate)

  // Delete
  app.delete('/:collection/:id', deleteQuery)
}
