'use strict'

const NS = require('./namespace')
    , Message = require('./Message')


const H = require('horten')
    , Cursor = H.Cursor

class Connection extends Cursor {
  constructor() {
    super()
    this.on('delta', this[ NS.onDelta ].bind( this ) )
    this.listening = true
  }

  send( msg ) {
    if ( !this[ NS.connection ] )
      throw new Error('Cannot send with no connection')


    msg = JSON.stringify( msg )
    // console.log('send', msg )

    this[ NS.connection ].send( msg )
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
}

Connection.prototype[ NS.onMessage ] = function ( msg ) {
  const self = this
  // console.log( 'onMessage', msg )

  try {
    msg = JSON.parse( msg )
  } catch ( e ) {
    // console.error('error:json')
    self.emit('error')
    close()
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

Connection.prototype[ NS.onError ] = function ( mesg ) {

}

Connection.prototype[ NS.onClose ] = function ( mesg ) {

}

Connection.prototype[ NS.onDelta ] = function ( delta ) {
  // console.log('onDelta', delta )
  const mesg = Message.delta( delta, [] )
  this.send( mesg )
}


Connection.prototype[ NS.setConnection ] = function ( connection ) {
  // // console.log('setConnection', this )
  this[ NS.connection ] = connection

  connection.on('message', this[ NS.onMessage ].bind( this ) )
  connection.on('error',   this[ NS.onError ]  .bind( this ) )
  connection.on('close',   this[ NS.onClose ]  .bind( this ) )
}

module.exports = Connection
