'use strict'

require('setimmediate')

const NS = require('./namespace')
    , Message = require('./Message')


const H = require('horten')
    , Cursor = H.Cursor
    , withCallback = require('with-callback')

class Connection extends Cursor {
  constructor() {
    super()

    this.configure({
      delay: 1,
      onDelta: this[ NS.onDelta ].bind( this )
    })

    this[ NS.tick ] = this[ NS.tick ].bind( this )

  }

  send( msg ) {
    if ( !this[ NS.connection ] )
      throw new Error('Cannot send with no connection')

    this.emit('send', msg )
    msg = JSON.stringify( msg )
    this[ NS.connection ].send( msg )
    this[ NS.tick ]()
  }

  pull() {
    const self = this
        , path = H.path.split( arguments )
        , message = Message.pull( path )

    self.send( message )
    return new Promise( function ( resolve, reject ) {
      self.once('deltaRemote', function ( data, deltaPath ) {
        if ( H.path.equal( deltaPath, path ) ) {
          resolve( data )
        }
      })
    })
  }

  close( ) {
    const self = this

    if ( self[ NS.closingPromise ] ) {
      return self[ NS.closingPromise ]
    }

    const connection = self[ NS.connection ]

    if ( !connection )
      return Promise.resolve()

    self[ NS.setStatus ]( { readyState: 2, status: 'closing', open: false } )
    var promise = self[ NS.closingPromise ] = withCallback( ( cb ) => {
      connection.close()
      setImmediate( cb )
    })
    .catch( function ( closeError ) {
      // Probably don't care...
      console.error('Connection.close', closeError )
    })
    .then( () => {
      self[ NS.connection ] = null
      self[ NS.closingPromise ] = null
      // console.log('client.close!')
      self[ NS.setStatus ]( { readyState: 3, status: 'closed', open: false } )
      self.emit('close')
    })

    return promise
  }

  isOpen() {
    if ( this[ NS.closingPromise ] )
      return false

    if ( this[ NS.connection ] ) {
      const readyState = this[ NS.connection ].readyState
      switch ( readyState ) {
        case 0:
          return false

        case 1:
          return true

        default:
          this.close()
          return false
      }
    }
  }
}

Connection.prototype[ NS.tick ] = function () {
  const self = this
      , isOpen = self.isOpen()

  var next

  if ( isOpen ) {
    const connection = this[ NS.connection ]
        , bufferedAmount = connection.bufferedAmount

    if ( bufferedAmount ) {
      self.hold = true
      next = true
    } else {
      self.hold = false
      self.release()
    }
  } else {
    // not open
    self.hold = true
  }

  if ( next ) {
    setImmediate( self[ NS.tick ] )
  }
}

Connection.prototype[ NS.onMessage ] = function ( msg ) {
  const self = this

  try {
    msg = JSON.parse( msg )
  } catch ( e ) {
    // console.error('error:json')
    self.emit('error')
    self.close()
    return
  }

  self.emit('message', msg )

  if ( 'object' == typeof msg && msg !== null ) {
    switch ( msg.type ) {
      case 'pull':
        var path = H.path.split( msg.path )
          , data = self.get( path )
          , wrapped = H.wrap( data, path )
          , response = Message.delta( wrapped )

        self.send( response )
      break

      case 'delta':
        var path = H.path.split( msg.path )
          , data = msg.data

        // console.log( 'deltaRemote', data, path, self )
        self.patch( data, path )
        self.emit( 'deltaRemote', data, path )
      break
    }
  }
}

Connection.prototype[ NS.onError ] = function ( err ) {
  this[ NS.setStatus ]( { readyState: 2, status: 'error', error: err } )
  // this.emit('error', err )
}

Connection.prototype[ NS.onClose ] = function ( reason ) {
  this[ NS.setStatus ]( { readyState: 3, status: 'closed', open: false } )
  this.emit('close' )
}

Connection.prototype[ NS.onDelta ] = function ( delta ) {
  // console.log('Connection.onDelta', delta )
  delta = H.unset( delta, '_local' )
  const mesg = Message.delta( delta, [] )
  if ( this.isOpen() )
    this.send( mesg )
}

Connection.prototype[ NS.setConnection ] = function ( connection ) {
  // // console.log('setConnection', this )
  this[ NS.connection ] = connection


  if ( 'function' == typeof connection.on ) {
    // Is ws
    connection.on('message', this[ NS.onMessage ].bind( this ) )
    connection.on('error',   this[ NS.onError ]  .bind( this ) )
    connection.on('close',   this[ NS.onClose ]  .bind( this ) )
  } else {
    // Is real, native WebSocket
    connection.onmessage = this[ NS.onWebSocketMessage ].bind( this )
    connection.onerror   = this[ NS.onError ]  .bind( this )
    connection.onclose   = this[ NS.onClose ]  .bind( this )
  }

  this.hold = false
}

Connection.prototype[ NS.setStatus ] = function ( status ) {
  if ( this.statusPass )
    this.root.patch( status, this.statusPass )
}

module.exports = Connection
