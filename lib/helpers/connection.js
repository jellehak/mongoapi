/**
 * Functions to connect to database
 */

const MongoClient = require('mongodb').MongoClient
var myDbs = {}

module.exports = {
  connectPromise,
  getCollection,
  closeAll
}

// Connect, using Promise
async function connectPromise (connStr, options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}) {
  return myDbs[connStr]
    ? myDbs[connStr]
    : MongoClient.connect(connStr, options).then(client => {
      // console.log(client.s.options)
      const { dbName } = client.s.options
      const db = client.db(dbName)
      myDbs[connStr] = db
      // console.log('connStr', connStr)
      // console.log('Db', db)

      return db
    }).catch(err => console.warn(err))
  // if (myDbs[connStr] === undefined) {
  //   return MongoClient.connect(connStr).then(db => myDbs[connStr] = db)
  // }

  // return new Promise(function (resolve, reject) {
  //   resolve(myDbs[connStr])
  // })
}

// Connect to collection
function getCollection (db, collectionName) {
  return new Promise(function (resolve, reject) {
    db.collection(collectionName, function (error, collection) {
      error ? reject(error) : resolve(collection)
    })
  })
}

// Close all opened connections
function closeAll () {
  for (var key in myDbs) {
    if (myDbs.hasOwnProperty(key)) {
      myDbs[key].close()
    }
  }

  myDbs = {}
}
