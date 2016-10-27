const test = exports
test.assert = require('chai').assert
test.Loopin = require('loopin')

var ID = 0
const nextId = () => ID++

const NS = require('../src/namespace')
    , Server = require('../src/Server')
    , Logger = require('../src/Logger')
    , Client = require('../src/Client')


const H = require('horten')
    , Mutant = H.Mutant

const Promise = require('bluebird')

const PORT = 4000

test.port = ( override ) => Math.max( 0, parseInt( override ) ) || PORT

test.createClientServer = function () {
  const port = PORT

  const client = test.createClient( port )
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
  const url = 'ws://localhost:'+port
  const opt = { pull: false }
  const client = new Client()
  const logger = new Logger()
  logger.target = client
  client.name = 'client:'+nextId()

  client.mutant = new Mutant()


  return client
}

test.createServer = function ( port ) {
  port = test.port( port )
  const server = new Server()
  const logger = new Logger()
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


const DATA_KEYS = ['sparky','skookum','saddlebag','sarcasm','such']

test.data = function() {
  const result = {}
  for ( var i = 0; i < 3; i ++ ) {
    var ind = Math.floor( DATA_KEYS.length * Math.random() )
      , key = DATA_KEYS[ind]

    result[key] = Math.round( Math.random() * 12 ) * Math.pow( 2, Math.round( Math.random() * 4 - 2 ) )
  }

  return result 
}
