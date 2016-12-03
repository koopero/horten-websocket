var test = exports
test.assert = require('chai').assert

var ID = 0
var nextId = () => ID++

var NS = require('../src/namespace')
    , Server = require('../src/Server')
    , Logger = require('../src/Logger')
    , Client = require('../src/Client')


var H = require('horten')
    , Mutant = H.Mutant

var Promise = require('bluebird')

var PORT = 4000

test.port = ( override ) => Math.max( 0, parseInt( override ) ) || PORT

test.createClientServer = function () {
  var port = PORT

  var client = test.createClient( port )
      , server = test.createServer( port )

  return {
    client: client,
    server: server,
    open: () => server.listen( port ).then( () => client.open( port ) ),
    close: () => Promise.all( [ server.close(), client.close() ] ),
  }
}

test.createClient = function ( port ) {
  port = test.port( port )
  var url = 'ws://localhost:'+port
  var opt = { pull: false }
  var client = new Client()
  var logger = new Logger()
  logger.target = client
  client.name = 'client:'+nextId()

  client.mutant = new Mutant()


  return client
}

test.createServer = function ( port ) {
  port = test.port( port )
  var server = new Server()
  var logger = new Logger()
  logger.target = server
  server.name = 'server:'+nextId()
  server.mutant = new Mutant()
  server[ NS.verbose ] = true
  return server
}

test.waitFor = function ( eventName, emitter ) {
  return new Promise( function ( resolve ) {
    emitter.once( eventName, resolve )
  })
}

test.shouldNotFire = function ( eventName, emitter ) {
  return new Promise( function ( resolve, reject ) {
    emitter.once( eventName, function () {
      reject( new Error(`Event ${eventName} fired when it should not have done so.`) )
    } )

    setTimeout( resolve, 50 )
  })
}

test.ping = function( port ) {

}


var DATA_KEYS = ['sparky','skookum','saddlebag','sarcasm','such']

test.data = function() {
  var result = {}
  for ( var i = 0; i < 3; i ++ ) {
    var ind = Math.floor( DATA_KEYS.length * Math.random() )
      , key = DATA_KEYS[ind]

    result[key] = Math.round( Math.random() * 12 ) * Math.pow( 2, Math.round( Math.random() * 4 - 2 ) )
  }

  return result
}
