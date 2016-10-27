'use strict'

const NS = require('./namespace')

const _server = Symbol('_server')
    , _closingPromise = Symbol('_closingPromise')

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

    const self = this
        , middleWare = self.middleWare()

    return self.close()
    .then( () => Promise.fromCallback( function ( cb ) {
      if ( self[ _server ] )
        self[ _server ].close()

      self[ _server ] = middleWare.listen( port, cb )
    }))
    .then( () => self.emit('listen', { port: port } ) )
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
      setImmediate( cb )
    })
    .then( () => {
      self[ _server ] = null
      self[ _closingPromise ] = null
      self.emit('close')
    })
  }

  middleWare() {
    return require('./middleWare')( this )
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

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  const id = this[ NS.connections ]
  .filter( ( connection ) => connection.ip == ip ).length

  const connection = new Connection()
  connection._id = Math.random()
  connection[ NS.setConnection ]( ws )
  connection.mutant = this.mutant
  connection.listening = true
  connection.ip = ip
  if ( this[ NS.verbose ] ) {
    const logger = new Logger()
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
