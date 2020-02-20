module.exports = {
  db: process.env.MONGODB || process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
  server: {
    port: process.env.PORT || 3000,
    address: '0.0.0.0'
  },
  accessControl: {
    allowOrigin: '*',
    allowMethods: 'GET,POST,PUT,DELETE,HEAD,OPTIONS',
    allowCredentials: false
  },
  mongoOptions: {
    serverOptions: {},
    dbOptions: {
      w: 1
    }
  },
  humanReadableOutput: true,
  collectionOutputType: 'json',
  urlPrefix: '',
  queryKeys: {
    // Same as https://github.com/typicode/json-server
    page: '_page',
    sort: '_sort',
    order: '_order', // 'desc' : 'asc'
    // Slice
    start: '_start',
    end: '_end',
    limit: '_limit',
    // Opterators
    _gte: '_gte',
    _lte: '_lte',
    _ne: '_ne',
    _like: '_like', // E.g. title_like=server
    // Full text search
    query: 'q',
    // Relationshipts
    embed: '_embed',
    expand: '_expand'
  },
  schema: {
    test: {
      users: {
        definitions: {},
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'http://example.com/root.json',
        type: 'object',
        title: 'The Root Schema',
        required: [
          'price',
          'tags'
        ],
        properties: {
          price: {
            $id: '#/properties/price',
            type: 'number',
            title: 'The Price Schema',
            default: 0.0,
            examples: [
              12.5
            ]
          },
          tags: {
            $id: '#/properties/tags',
            type: 'array',
            title: 'The Tags Schema',
            items: {
              $id: '#/properties/tags/items',
              type: 'string',
              title: 'The Items Schema',
              default: '',
              examples: [
                'home',
                'green'
              ],
              pattern: '^(.*)$'
            }
          }
        }
      }
    }
  }
}
