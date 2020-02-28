// const { apiKey } = require('@/config')

module.exports = (apiKeys = []) => (req, res, next) => {
  const { authorization } = req.headers
  const [type, key] = authorization.split(' ')

  // Check for apiKey
  if (type.toUpperCase() === 'ApiKey'.toUpperCase()) {
    const isValid = apiKeys.includes(key)
    // console.log(isValid)
    if (isValid) {
      return next()
    } else {
      res.status(401).send('unvalid apikey')
    }
  }

  // Ai
  res.status(401).send('not for you')
}
