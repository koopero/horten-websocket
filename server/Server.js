'use strict'

const NS = require('../common/namespace')

const _server = Symbol('_server')
    , _closingPromise = Symbol('_closingPromise')

const DEFAULT_PORT = 4000

const H = require('horten')
    , Promise = require('bluebird')
    , Cursor = H.Cursor

const Connection = require('../common/Connection')

class Server extends Cursor {
  constructor () {
    super()
    this[ NS.connections ] = []
  }

  listen( port ) {
    // console.log('listen')
    port = Math.max( parseInt( port ) || 0, 0 ) || DEFAULT_PORT

    const self = this
        , middleWare = self.middleWare

    return self.close()
    .then( () => Promise.fromCallback( function ( cb ) {
      if ( self[ _server ] )
        self[ _server ].close()

      self[ _server ] = middleWare.listen( port, cb )
      self.emit('listen', { port: port } )
    }))
  }

  close( ) {
    const self = this

    if ( self[ _closingPromise ] )
      return self[ _closingPromise ]

    const server = self[ _server ]

    if ( !server )
      return Promise.resolve()

    return self[ _closingPromise ] = Promise.fromCallback( function ( cb ) {
      server.close()
      setTimeout( cb, 100 )
    })
    .then( () => {
      self[ _server ] = null
      self[ _closingPromise ] = null
      self.emit('close')
    })
  }

  get middleWare() {
    const self = this
        , express = require('express')
        , app = express()
        , ws = require('express-ws')( app )

    app.ws('/', ( ws, req ) => self[ NS.createConnection ]( ws, req ) )

    return app
  }

  send( mesg ) {
    const self = this
    this[ NS.connections ].forEach( function ( connection ) {
      connection.send( mesg )
    })
  }
}

Server.prototype[ NS.createConnection ] = function ( ws, req ) {
  console.log( 'createConnection?' )
  try {
    const connection = new Connection()
    connection._id = Math.random()
    
    connection[ NS.setConnection ]( ws )
    connection.mutant = this.mutant
    connection.listening = true
    connection.on('message', this[ NS.onClientEvent ].bind( this, 'message' ) )
    connection.on('deltaRemote', this[ NS.onClientEvent ].bind( this, 'deltaRemote' ) )
    connection.on('close', this[ NS.onClientClose ].bind( this ) )

    this[ NS.connections ].push( connection )
  } catch ( e ) {
    console.error( e )
  }
  console.log( 'createConnection!' )
}

Server.prototype[ NS.onClientEvent ] = function ( name ) {
  console.log('onClientEvent', name )
  this.emit.apply( this, arguments )
}

Server.prototype[ NS.onClientMessage ] = function ( mesg, connection ) {
  this.emit('message', mesg )
}

Server.prototype[ NS.onClientClose ] = function ( connection ) {
  // console.log('closeConnection?')
  // const connection = new Connection()
  // connection.setReq( req )
  // connection.setWS( ws )
  // this[ NS.connections ].push( connection )
}

module.exports = Server
