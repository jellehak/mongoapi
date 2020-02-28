/**
 * Route action for performing GET query
 */

const connection = require('../helpers/connection')
const castId = require('../helpers/cast-id')
const transformCollection = require('../helpers/transform-collection')

// Apply query options
const applyOptions = (cursor, o = {}) => {
  if (o.sort) cursor.sort(o.sort)
  if (o.hint) cursor.hint(o.hint)
  if (o.snapshot) cursor.snapshot(!!o.snapshot)
  if (o.limit) cursor.limit(parseInt(o.limit))
  if (o.skip) cursor.skip(parseInt(o.skip))
  if (o.fields) cursor.project(o.fields)
  if (o.count) return cursor.count(true)

  return o.explain
    ? cursor.explain()
    : cursor.toArray()
}

const removeKeysFromObject = (_obj, keys = []) => {
  const obj = { ..._obj }
  keys.forEach(function (key) {
    delete obj[key]
  })
  return obj
}

module.exports = config => (request, response) => {
  // Process fetched documents
  const processDocs = (docs) => {
    // Result of explain query
    if (typeof docs.queryPlanner !== 'undefined') {
      return response.json(docs)
    }

    // Result of count operation
    if (Number.isInteger(docs)) {
      return response.json({ count: docs })
    }

    var result = []

    if (request.params.id) {
      if (docs.length > 0) {
        result = docs[0]
        response.json(result)
      } else {
        response.status(404).json({ ok: 0 })
      }
    } else {
      docs.forEach(function (doc) {
        result.push(doc)
      })

      const outputType = request.query.output || collectionOutputType
      result = transformCollection(config, outputType, result)
      response[outputType](result)
    }
  }

  // const { filter, skip, limit, sort, projection, population } = aqp(req.query)
  // Map query params to mongodb options { filter, skip, limit, sort, projection, population }
  const buildQueryOptions = (query) => {
    // an X-Total-Count header is included in the response)

    const order = query._order === 'asc' ? 1 : -1

    return {
      // _page: '',
      sort: { [query._sort]: order },
      // _order: '',
      skip: query._start,
      // _end: 'end',
      limit: query._limit
      // _embed: '',
      // _expand: ''
    }
  }

  // From https://github.com/loris/api-query-params/blob/master/src/index.js
  const processValue = (value) => {
    // Match boolean values
    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    // Match null
    if (value === 'null') {
      return null
    }

    // Match numbers (string padded with zeros are not numbers)
    if (!Number.isNaN(Number(value)) && !/^0[0-9]+/.test(value)) {
      return Number(value)
    }

    // Match YYYY-MM-DDTHH:mm:ssZ format dates
    const date = value.match(
      /^[12]\d{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)(T| )?(([01][0-9]|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/
    )
    if (date) {
      return new Date(value)
    }

    return value
  }

  // Build query object
  const buildQuery = (query, operator = []) => {
    const dbQuery = {}
    // var query = _query.query ? JSON.parse(_query.query) : _query
    // console.log(query)

    // Loop keys
    // Object.entries(query).forEach(([key, value]) => {
    //   const valueProcessed = processValue(value)
    //   console.log('loop', key, value, valueProcessed)
    // })

    Object.entries(query).forEach(([key, value]) => {
      const elements = key.split('_')
      const possibleOperator = elements[elements.length - 1]

      // console.log('possibleOperator', possibleOperator)
      // TODO improve
      const fullOperator = `_${possibleOperator}`

      if (operator.includes(fullOperator)) {
        const cleanKey = key.replace(fullOperator, '')
        // query.startdate = { $gte: processValue(value) }
        dbQuery[cleanKey] = { [`$${possibleOperator}`]: processValue(value) }
      } else {
        dbQuery[key] = processValue(value)
      }
    })

    // console.log('Processed query', query)

    return dbQuery
  }

  // ====
  // Handle request
  const { query, params } = request

  const collectionOutputType = config.collectionOutputType || 'json'

  const paginate = [
    '_sort',
    '_order',
    // Paginate / Slice
    '_page', // NOT SUPPORTED
    '_limit',
    '_start',
    '_end' // NOT SUPPORTED
  ]
  const operator = ['_gte', '_lte', '_ne', '_like', 'q']
  // const operator = ['gte', 'lte', 'ne', '_like', 'q']
  const relationships = ['_embed', '_expand']
  const specials = [
    ...paginate,
    ...relationships
  ]
  const filterOptions = removeKeysFromObject(query, specials)

  const dbQuery = {
    ...buildQuery(filterOptions, operator)
    // Providing an id overwrites giving a query in the URL
    // _id: params.id
    //   ? castId(params.id)
    //   : castId(query._id)
  }
  if (params.id) {
    dbQuery._id = castId(params.id)
  }

  const dbOptions = buildQueryOptions(query)
  console.log(dbQuery, dbOptions)

  // TODO
  // response.headers['X-Total-Count'] = 100
  response.header('X-Total-Count', 100)

  connection.connectPromise(request.dbUri)
    .then(db => db.collection(request.params.collection), error => { throw new Error('Db open error: ', error) })
    .then(collection => collection.find(dbQuery), error => { throw new Error('Error getting collection: ', error) })
    .then(cursor => applyOptions(cursor, dbOptions), error => { throw new Error('Error finding document(s): ', error) })
    .then(docs => processDocs(docs), error => { throw new Error('Error finding document(s): ', error) })
}
