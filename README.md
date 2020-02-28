mongoapi
============
Get a full REST API with **zero coding** in **less than 30 seconds** \(seriously\) Hyper-Heavily inspired on [json-server](https://github.com/typicode/json-server)

This is a rewrite of the great `mongodb-rest` (https://github.com/ltonetwork/mongodb-rest) package to be compatible to `json-server` query definitions (_start, _limit, ...). 

Changes include:
- Similar API as https://github.com/typicode/json-server
- Cleaner code

A simple but incredibly useful REST API server for MongoDB using Node, Express and the native node.js MongoDB driver.

# Roadmap
- [ ] Endpoint based policies
- [ ] User roles
- [ ] Be able to switch to AQP query style `https://www.npmjs.com/package/api-query-params`

# Similar projects
https://nomadas.gitbook.io/mongo-server
https://github.com/ltonetwork/mongodb-rest

Installation
------------

Installation is via npm:
> npm install mongoapi

You can install globally using -g:
> npm install -g mongoapi

Now issue `mongoapi` on the command line and the server should start.

NOTE: Make sure you are running a MongoDB database in addition to the mongoapi server.

Test
----

After installation you can quickly test it by issuing the following from the command line:<br/>
> curl -d '{ "A1" : 201 }' -H "Content-Type: application/json" http://localhost:3000/test/example1

This should add a document to the "test" db.example1 collection:

	{
		"A1": 201,
		"_id": ObjectId("4e90e196b0c7f4687000000e")
	}

Start Server Programmatically
-----------------------------

mongoapi can easily be started programmatically by 'requiring' the module and calling `startServer`.
```js
	const mongodbRest = require('mongoapi/server.js');
	mongodbRest.startServer();
```
You can optionally pass in a configuration object:
```js
	mongodbRest.startServer(config);
```

Configuration
-------------

When starting from the command line you should have `config.json` in the current working directory. The project includes an example configuration file.

When starting the server programmatically you can pass in a Javascript object for mongoapi configuration.

Here is an example JSON configuration object:

    {
        "db": "mongodb://localhost:27017",
        "endpoint_root": "server",
        "server": {
            "port": 3000,
            "address": "0.0.0.0"
        },
        "accessControl": {
            "allowOrigin": "*",
            "allowMethods": "GET,POST,PUT,DELETE,HEAD,OPTIONS",
            "allowCredentials": false
        },
        "dbAccessControl": {
            "foo_database": ["collection1", "collection2"],
            "bar_database": ["collection2", "collection3"],
            "zoo_database": [],
        },
        "mongoOptions": {
            "serverOptions": {
            },
            "dbOptions": {
                "w": 1
            }
        },
        "humanReadableOutput": true,
        "urlPrefix": "",
        "schema": {
            "foo_database": {
                "collection1": {
                    "definitions": {},
                    "$schema": "http://json-schema.org/draft-06/schema#",
                    "$id": "http://json-schema.org/draft-06/schema#",
                    "type": "object",
                    "properties": {
                        "value": {
                            "$id": "/properties/value",
                            "type": "boolean",
                            "title": "Foo boolean value",
                            "description": "An explanation about the purpose of this instance.",
                            "default": false,
                            "examples": [
                                false
                            ]
                        }
                    }
                }
            }
        }
    }

`db` specifies the mongodb connection string for connection to the database. It defaults when not specified.

For documentation on the mongodb connection string: http://docs.mongodb.org/manual/reference/connection-string/

For backward compatibility `db` can also be set to an object that specified `host` and `port` as follows:

	"db": {
        "port": 27017,
        "host": "localhost"
	}

---

`endpoint_root` can have one of two values: `server`, `database`. If it is ommited, the `server` value is presumed. `server` means that we can select a database for each query, setting its name in an url, like `GET /test_db/test_collection/foo_id`. If instead `database` value is set, than connection is restricted to a single database, given in config connection options: `"db": "mongodb://localhost:27017/test_db"`. Then all the urls should ommit db parameter. So the previous query will look like `GET /test_collection/foo_id`.

---

`server` specifies the configuration for the REST API server, it also defaults if not specified.

---

`mongoOptions` specifies MongoDB server and database connection parameters. These are passed directly to the MongoDB API.

Valid options under `serverOptions` are documented here: http://mongodb.github.io/node-mongodb-native/api-generated/server.html.

`auto_reconnect` is automatically enabled, don't override this or mongoapi may not work as expected.

Valid options under `dbOptions` are documented here: http://mongodb.github.io/node-mongodb-native/api-generated/db.html.

`w` (write concern) is set to 1 so that acknowledgement of the write is recieved by mongoapi, currently this must be enabled for error checking.

Set `collectionOutputType` to `csv` to returns collections as csv data rather than json.

If you are configuring the server procedurally you can assign a Javascript function to `transformCollection` which will transform each collection before returning it via HTTP.

---

The `accessControl` options allow you to set the following headers on the HTTP response:
- Access-Control-Allow-Origin
- Access-Control-Allow-Methods
- Access-Control-Allow-Credentials

Help for these headers can be found here:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS

---

`dbAccessControl` can be used for limiting access only to certain databases or collections. If ommited, user can reach to any database and collection.

If `endpoint_root` is set to `server`, than the syntax for this option is as follows:

    {
        "database_name": ["collection_name1", "collection_name2"],
        "database_name2": [],
    }

This example allows access only to two databases. For `database_name` only two collections are accesible. For `database_name2` all collections are accesible.

If `endpoint_root` is set to `database`, than the syntax is as follows:

    [
        "collection_name1", "collection_name2"
    ]

So it's just a list of accesible collections. If array is empty, all collections are accesible.

---

The `urlPrefix` option allows specification of a prefix for the REST API URLs. This defaults to an empty string, meaning no prefix which was the original behavior. For example, given the following REST API URL:

	/database/collection

Setting a URL prefix of `/blah` will change the example REST API URL to:

	/blah/database/collection

The URL prefix should allow the REST API to co-exist with another REST API and can also be used a very primitive form of security (by setting the prefix to a _secret key_).

---

`schema` option defines json schemas for collections. So all the documents in given collections should match defined schemas. Schema validation is performed on `insert`, `replace` and `update` operations. If new document does not passes schema validation, response code `400` is returned.

Logging
-------

Winston logging is supported if you configure the REST API programmatically. When you call `startServer` and pass in configuration options set the `logger` option to your Winston logger. Mongoapi uses the following functions: verbose, info, warn and error.

Please see the Winston documentation for more setup details: https://github.com/flatiron/winston

Supported REST API
------------------

**Listing Databases:**
_Format:_ `GET /dbs`

    $ curl 'http://127.0.0.1:3000/dbs/' \
    >   -D - \
    >   -H 'Accept: application/json'
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 27
    ETag: W/"1b-134804454"
    Date: Thu, 02 Jul 2015 08:02:26 GMT
    Connection: keep-alive

    [
        "local",
        "test"
    ]


**Listing Collections:**
_Format:_`GET /<db>/`


    $ curl 'http://127.0.0.1:3000/test/' \
    >   -D - \
    >   -H 'Accept: application/json'
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 27
    ETag: W/"1b-134804454"
    Date: Thu, 02 Jul 2015 08:02:26 GMT
    Connection: keep-alive

    [
       "new-collection",
       "startup_log",
       "system.indexes"
    ]


**List Documents in a Collection:**
_Format:_ `GET /<db>/<collection>`

    $ curl 'http://127.0.0.1:3000/test/new-collection' \
    >   -D - \
    >   -H 'Accept: application/json'
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 27
    ETag: W/"1b-134804454"
    Date: Thu, 02 Jul 2015 08:02:26 GMT
    Connection: keep-alive

    [
        {
            "_id": "5594bf2b019d364a083f2e03",
            "attribute": "hello"
        }
    ]

**Output a CSV collection:**
_Format:_`GET /<db>/<collection>?output=csv`

    $ curl http://127.0.0.1:3000/test/newcollection?output=csv > Sample.csv

**List documents satisfying a query:**
_Format:_`GET /<db>/<collection>?query={"key":"value"}`

    $ curl -X "GET" http://localhost:3000/test/newcollection \
    -d 'query={"attribute":"value"}
    [
    {
        "_id": "5594bf2b019d364a083f2e03",
        "attribute": "value"
    }
    ]


**List documents with nested queries:**
_Format:_`GET /<db>/<collection>?query={"key":{"second_key":{"_id":"value"}}}`

    $ curl -X "GET" http://localhost:3000/test/newcollection \
        -d 'query={"attribute":{"other_attribute:{"_id":"5063114bd386d8fadbd6b004"}}}
        [
        {
            "_id": "5594bf2b019d364a083f2e03",
            "attribute": {
                other_attribute: "5063114bd386d8fadbd6b004"
            }
        }
        ]

**Return document by id:**
_Format_ `GET /<db>/<collection>/id`

    $ curl -X "GET" http://localhost:3000/test/nested/5594bf2b019d364a083f2e03
    {
        "_id": "5594bf2b019d364a083f2e03",
        "attribute": "hello"
    }

**Inserting documents:**
_Format:_ `POST /<db>/<collection>`

    $ curl 'http://localhost:3000/test/newcollection' \
    >   -D - \
    >   -X POST \
    >   -H 'Content-Type: application/json' \
    >   -H 'Accept: application/json' \
    >   --data '{"title": "Some title", "content": "document content"}'

    HTTP/1.1 201 CREATED
    Date: Thu, 02 Jul 2015 12:50:34 GMT
    Connection: keep-alive
    Content-Type: application/json; charset=utf-8
    X-Powered-By: Express
    Content-Length: 15
    {
        "_id": "5595339aa73107ad070e891a",
        "title": "Some title",
        "content": "document content"
    }

**Replacing a document:**
_Format_: `PUT /<db>/<collection>/id`

    $ curl -X "PUT" "http://localhost:3000/test/nested/5595339aa73107ad070e891a \
    > --data {"title": "New title", "content": "New document content"}'
    HTTP/1.1 200 OK
    Connection: keep-alive
    Content-Type: application/json; charset=utf-8
    X-Powered-By: Express
    Content-Length: 15
    Date: Thu, 02 Jul 2015 12:53:00 GMT
    {
        "_id": "5595339aa73107ad070e891a",
        "title": "New title",
        "content": "New document content"
    }

**Updating a document:**
_Format_: `PATCH /<db>/<collection>/id`

    $ curl -X "PUT" "http://localhost:3000/test/nested/5595339aa73107ad070e891a \
    > --data {"title": "New title", "content": "New document content", "field_to_delete": null}'
    HTTP/1.1 200 OK
    Connection: keep-alive
    Content-Type: application/json; charset=utf-8
    X-Powered-By: Express
    Content-Length: 15
    Date: Thu, 02 Jul 2015 12:53:00 GMT
    {
        "_id": "5595339aa73107ad070e891a",
        "title": "New title",
        "content": "New document content"
    }

**Deleting a document by id:**
_Format:_ `DELETE /<db>/<collection>/id`

    $ curl -X "DELETE" "http://localhost:3000/test/nested/5595339aa73107ad070e891a
    HTTP/1.1 200 OK
    Connection: keep-alive
    Content-Type: application/json; charset=utf-8
    X-Powered-By: Express
    Content-Length: 15
    Date: Thu, 02 Jul 2015 12:53:00 GMT
    {
        "ok": 1
    }

**Bulk write (insert, update and delete)**
_Format:_ `POST /<db>/bulk`

    $ curl 'http://localhost:3000/test/bulk' \
    >   -D - \
    >   -X POST \
    >   -H 'Content-Type: application/json' \
    >   -H 'Accept: application/json' \
    >   --data '{"data": {"collection1": {"insert": [{"Title": "Some title"}, {"_id": "5595339aa73107ad070e891a", "Key": "Value"}], "update": [{"_id": 123, "New field": "new value"}]}, "collection2": {"delete": [{"name": "John"}, {"_id": "5595339aa73107ad070e891b"}]}}}'

    HTTP/1.1 200 OK
    Date: Thu, 02 Jul 2015 12:50:34 GMT
    Connection: keep-alive
    Content-Type: application/json; charset=utf-8
    X-Powered-By: Express
    Content-Length: 15
    {
        "ok": 1
    }

For bulk write operation the following syntax of POST body should be used:

    {
        "data": {
            "collection1": {
                "insert": [<doc1>, <doc2>, ...],
                "update": [<doc3>, <doc4>, ...],
                "delete": [<doc5>, <doc6>, ...],
            },
            "collection2": {
                "insert": [<doc1>, <doc2>, ...],
                "update": [<doc3>, <doc4>, ...],
                "delete": [<doc5>, <doc6>, ...],
            },
            ...
        }
    }

So `insert`, `update` and `delete` operations can be performed in a single request for multiple collections.

Documents in `update` section should contain an `_id` field, that acts as a filter. The rest fields are used in mongo `$set` operator to update existing document.

Documents in `insert` and `delete` section are not obligated to contain `_id` field.

**Content Type:**

Please make sure `application/json` is used as Content-Type when using POST/PUT with request bodies.

Query options
-------------

When performing a query `GET /<db>/<collection>`, some options can be applyed together with filter. The following options are supported:

* skip *(int)*
* limit *(int)*
* sort *(object)*
* hint *(object)*
* fields *(object)*
* snapshot *(boolean)*
* count *(boolean)*
* explain *(boolean)*

For `explain` option, the explain is performed and returned for given query, no documents are returned.

For `count` option the response looks like `{count: 24}`, no documents are returned. Limit and skip options do influence the count.

An example of query with options:

```
    GET /<db>/<collection>?query={"key":"value"}&fields={"name":1,"surname":1}&limit=10&skip=2&snapshot=1&sort={"name":-1}&hint=index_name
```

Auth
----

**WARNING: This is a prototype feature and may change in the future**.

mongoapi supports a simple token-based auth system. Login is accomplilshed by a HTTP POST to `/login` with `username` and `password`, the server will verify the user's password against a secret database. Upon authentication an access token is returned that must be attached to each subsequent API requests.

An authorization token is specified via query parameter as follows:

```
GET /db/collection?token=234d43fdg-34324d-dd-dsdf-f435d
```

Authentication is enabled by adding `auth` to config.json as follows:

	"auth": {
		"usersDBConnection": "mongodb://localhost/auth",
		"usersCollection": "users",
		"tokenDBConnection": "mongodb://localhost/auth",
		"tokensCollectionName": "tokens",
		"universalAuthToken": "this-token-grants-universal-access-so-please-change-it",
		"tokenExpirationTimeHours": 8
	}

`auth` requires at least:

* usersDBConnection - mongodb connection string for the users database.
* tokenDBConnection - mongodb connection string for the tokens database.

Here are the docs for mongodb connection strings: http://docs.mongodb.org/manual/reference/connection-string/

The following are optional:

* usersCollection - The auth database collection where users are stored.
* tokensCollectionName - The auth database collection where tokens are stored.
* universalAuthToken - Specifies a token that can be used for universal authorization.
* tokenExpirationTimeHours - Specifies the timeout in hours before tokens must be renewed by 'login'.

An example configuration `example config with auth.json` is included with a working authentication setup.

** Please note that mongodb exposes all databases in the server, including your secret authentication database. Move your auth database to a different server on the same machine or ensure MongoDB authentication is setup correctly. Work will be done in the future that allows particular databases to be whitelisted/blacklisted and not exposed. **

Credits
-------

* [MongoDB Driver](http://github.com/christkv/node-mongodb-native)
* [Express](http://expressjs.com/)
* [npm](http://npmjs.org/)
