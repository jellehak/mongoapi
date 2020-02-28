const connection = require('../helpers/connection')

module.exports = function (app, config) {
  if (!config.auth) {
    // Authentication is not enabled.
    return
  }

  if (!config.auth.usersDBConnection) {
    throw new Error("Authentication has been enabled by including 'auth' in the configuration, but users database connection string 'usersDBConnection' has not been specified.")
  }

  const logger = config.logger
  const usersCollectionName = config.auth.usersCollection || 'users'
  app.use('/login', function (req, res) {
    const username = req.body.username
    const password = req.body.password

    if (!username) {
      const msg = '"username" not specified in request body.'
      logger.warning(msg)
      res.status(400).json({ message: msg })
      return
    }

    if (!password) {
      const msg = '"password" not specified in request body.'
      logger.warning('Request error: ' + msg)
      res.status(400).json({ message: msg })
      return
    }

    connection.connect(config.auth.usersDBConnection, function (err, usersDb) {
      if (err) {
        logger.error('Failed to connect to database ' + config.auth.usersDBConnection + ': ' + err.message)
        res.status(500).json({ message: 'Server error' })
        return
      }

      usersDb.collection(usersCollectionName, function (err, usersCollection) {
        if (err) {
          logger.error('Failed to get collection ' + usersCollectionName + ': ' + err.message)
          res.status(500).json({ message: 'Server error' })
          return
        }

        usersCollection.findOne({ username: username }, function (err, user) {
          if (err) {
            logger.error('Error finding user ' + username + ': ' + err.message)
            res.status(500).json({ message: 'Server error' })
          } else if (!user) {
            logger.warning('User ' + username + ' not found')
            res.status(401).json({ message: 'User or password is invalid' })
          } else if (user.password !== password) {
            logger.warning('Incorrect password for user ' + username)
            res.status(401).json({ message: 'User or password is invalid' })
          }
        })
      })
    })
  })

  app.use(function (req, res, next) {
    req.path = req.path.slice(4)

    // // If this is a login request, let them through
    // if (req.path === '/login') {
    //   return next()
    // }

    // Process authorization header
    const getKeyFromHeader = authorization => {
      const [type, key] = authorization.split(' ')
      return (type.toUpperCase() === 'APIKEY') ? key : null
    }

    const token = req.query.token || getKeyFromHeader(req.header('Authorization'))

    if (!token) {
      logger.warning('Unauthorized access - no token supplied')
      res.status(401).json({ error: 'Unauthorized access - no token supplied' })
      return
    }

    // If the given token is universal auth token, let the request through
    if (config.auth.universalAuthToken &&
            token === config.auth.universalAuthToken) {
      logger.verbose('Access authorized by use of universal auth token')
      // Remove token from request
      delete req.query.token
      return next()
    }

    // No access
    res.status(401).json({ error: 'Unauthorized access' })
  })
}
