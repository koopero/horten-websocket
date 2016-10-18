const test = exports
test.assert = require('chai').assert
test.Loopin = require('loopin')

const Server = require('../server/Server')
    , Client = require('../client/Client')

const H = require('horten')
    , Mutant = H.Mutant

const Promise = require('bluebird')

test.port = ( override ) => Math.max( 0, parseInt( override ) ) || 4000

test.createClientServer = function () {
  const port = test.port( port )

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
  client.mutant = new Mutant()
  return client
}

test.createServer = function ( port ) {
  port = test.port( port )
  const server = new Server()
  server.mutant = new Mutant()
  return server
}

test.waitFor = function ( eventName, emitter ) {
  return new Promise( function ( resolve ) {
    emitter.once( eventName, resolve )
  })
}

test.ping = function( port ) {

}
