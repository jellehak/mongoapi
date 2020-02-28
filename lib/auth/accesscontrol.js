module.exports = (config) => (req, res, next) => {
  if (req.header('Origin')) {
    if (config.accessControl.allowOrigin) {
      res.header('Access-Control-Allow-Origin', config.accessControl.allowOrigin)
    }

    if (config.accessControl.allowCredentials) {
      console.log('allowCredentials')
      res.header('Access-Control-Allow-Credentials', config.accessControl.allowCredentials)
    }

    if (config.accessControl.allowMethods) {
      res.header('Access-Control-Allow-Methods', config.accessControl.allowMethods)
    }

    // res.header('Access-Control-Allow-Headers', 'Authorization')

    if (req.header('Access-Control-Request-Headers')) {
      res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'))
    }
  }

  return next()
}
