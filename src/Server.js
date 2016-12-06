'use strict'

const NS = require('./namespace')

const DEFAULT_PORT = 4000

const H = require('horten')
    , Promise = require('bluebird')
    , Cursor = H.Cursor

const Connection = require('./Connection')
    , Logger = require('./Logger')

class Server extends Cursor {
  constructor () {
    super()
    this[ NS.connections ] = []
  }

  listen( port ) {
    // // console.log('listen')
    port = Math.max( parseInt( port ) || 0, 0 ) || DEFAULT_PORT

    var self = this
        , middleWare = self.middleWare()

    return self.close()
    .then( () => Promise.fromCallback( function ( cb ) {
      if ( self[ NS.server ] )
        self[ NS.server ].close()

      self[ NS.server ] = middleWare.listen( port, cb )
    }))
    .then( () => self.emit('listen', { port: port } ) )
  }

  close( ) {
    var self = this

    if ( self[ NS.closingPromise ] )
      return self[ NS.closingPromise ]

    var server = self[ NS.server ]

    if ( !server )
      return Promise.resolve()

    return self[ NS.closingPromise ] = Promise.fromCallback( function ( cb ) {
      server.close()
      setImmediate( cb )
    })
    .then( () => {
      self[ NS.server ] = null
      self[ NS.closingPromise ] = null
      self.emit('close')
    })
  }

  middleWare() {
    this[ NS.middleWare ] = this[ NS.middleWare ] || require('./middleWare')( this )
    return this[ NS.middleWare ]
  }

  send( mesg ) {
    this.emit('send', mesg )

    this[ NS.connections ].forEach( function ( connection ) {
      if ( connection.isOpen() )
        connection.send( mesg )
    })
  }
}

Server.prototype[ NS.createConnection ] = function ( ws, req ) {

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  var id = this[ NS.connections ]
  .filter( ( connection ) => connection.ip == ip ).length

  var connection = new Connection()
  connection._id = Math.random()
  connection[ NS.setConnection ]( ws )
  connection.mutant = this.mutant
  connection.listening = true
  connection.ip = ip
  if ( this[ NS.verbose ] ) {
    var logger = new Logger()
    logger.target = connection
  }


  connection.on('message', this[ NS.onClientEvent ].bind( this,  'message' ) )
  connection.on('deltaRemote', this[ NS.onClientEvent ].bind( this, 'deltaRemote' ) )
  connection.on('close', this[ NS.onClientClose ].bind( this, connection ) )
  connection.on('error', this[ NS.onClientError ].bind( this, connection ) )


  connection.name = `${ip}:${id}`

  this[ NS.connections ].push( connection )

  connection.emit('open')
}

Server.prototype[ NS.onClientEvent ] = function ( name ) {
  this.emit.apply( this, arguments )
}

Server.prototype[ NS.onClientMessage ] = function ( mesg, connection ) {
  this.emit('message', mesg )
}

Server.prototype[ NS.onClientClose ] = function ( connection ) {
  connection.removeAllListeners()

  var ind
  while ( ( ind = this[ NS.connections ].indexOf( connection ) ) != -1 )
    this[ NS.connections ].splice( ind, 1 )
}

Server.prototype[ NS.onClientError ] = function ( connection ) {
  console.log('Server.connection.error')
}


module.exports = Server
