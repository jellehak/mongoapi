/**
 * Functions to connect to database
 */

const MongoClient = require('mongodb').MongoClient
var myDbs = {}

module.exports = {
  connect,
  connectPromise,
  getCollection,
  closeAll
}

// Connect to database
function connect (connStr, callback) {
  if (myDbs[connStr] === undefined) {
    MongoClient.connect(connStr, { useNewUrlParser: true }, function (err, db) {
      if (err) {
        return callback(err)
      }

      myDbs[connStr] = db

      callback(null, db)
    })
  } else {
    callback(null, myDbs[connStr])
  }
}

// Connect, using Promise
async function connectPromise (connStr) {
  return myDbs[connStr]
    ? myDbs[connStr]
    : MongoClient.connect(connStr, { useNewUrlParser: true }).then(client => {
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
