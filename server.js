const express = require('express')
const bodyParser = require('body-parser')
const initRoutes = require('./lib/routes')
const defaultConfig = require('./config')

var server = null

module.exports = {
  startServer,
  stopServer
}

/**
 * Start the REST API server.
 */
async function startServer (customConfig) {
  const app = express()

  const config = {
    ...defaultConfig,
    ...customConfig
  }

  console.log(config)

  init(app, config)
  return run(app, config)
}

/**
 * Stop the REST API server.
 */
function stopServer () {
  if (!server) return

  server.close()
  server = null
}

/**
 * Init express application
 * @param {object} app
 * @param {object} config
 */
function init (app, config) {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  if (config.humanReadableOutput) {
    app.set('json spaces', 4)
  }

  // if (config.accessControl) {
  //   const accesscontrol = require('./lib/auth/accesscontrol')(config)
  //   app.use(accesscontrol)
  // }

  app.get('/favicon.ico', function (req, res) {
    res.status(404)
  })

  initRoutes(app, config)
}

/**
 * Perform server launch
 * @param {object} app
 * @param {object} config
 * @param {callback} onStarted
 */
async function run (app, config) {
  const logger = config.logger
  const host = config.server.address
  const port = config.server.port
  // const ssl = config.ssl || { enabled: false, options: {} }

  // const start = function () {
  //   logger.verbose(`Now listening on: ${host}:${port} SSL: ${ssl.enabled}`)

  //   if (onStarted) onStarted()
  // }

  logger.verbose(`Starting mongodb-rest server: http://${host}:${port}`)
  logger.verbose('Connecting to db: ', JSON.stringify(config.db, null, 4))

  return new Promise(resolve => {
    logger.verbose(`Now listening on: ${host}:${port}`)
    server = app.listen(port, host, resolve)
  })
}

/**
 * Auto start server when run as 'node server.js'
 */
const autoStart =
    process.argv.length >= 2 &&
    process.argv[1].indexOf('server.js') !== -1

if (autoStart) startServer()
