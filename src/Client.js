'use strict'

const NS = require('./namespace')
    , Connection = require('./Connection')

const H = require('horten')
    , Promise = require('bluebird')

class Client extends Connection {

  open ( url ) {
    if ( 'number' == typeof url  ) {
      url = Math.max( 0, parseInt( url ) ) || NS.DEFAULT_PORT
      url = 'ws://localhost:'+url+'/horten-websocket'
    }

    if ( !url ) {
      const window = global.window

      if ( window ) {
        var loc = window.location

        if (loc.protocol === "https:") {
            url = "wss:";
        } else {
            url = "ws:";
        }

        url += "//" + loc.host;
        url += '/horten-websocket';
      }
    }

    const self = this
        , opt = {}

    self._id = '_client'

    var promise = self[ NS.openingPromise ]


    promise = new Promise( function ( resolve, reject ) {
      const connection = new WebSocket( url )

      if ( 'function' == typeof connection.once ) {
        // Is ws
        connection.once('open', onOpen )
        connection.once('error', onError )
      } else {
        // Is real, native WebSocket
        connection.onopen = onOpen
        connection.onerror = onError
      }

      function onOpen() {
        self[ NS.setConnection ]( connection )
        resolve( self )
      }

      function onError( err ) {
        connection.removeAllListeners()
        reject( err )
      }
    })

    if ( opt.pull )
      promise = promise.then( function () {
        pull()
      } )

    promise = promise.then( function () {
      self[ NS.openingPromise] = null
      self.emit('open')
      self.listening = true
    })

    self[ NS.openingPromise ] = promise

    return promise
  }
}


Client.prototype[ NS.onWebSocketMessage ] = function ( message ) {
  this[ NS.onMessage ]( message.data )
}

// Client.prototype[ NS.onConnectionOpen ] = function onConnectionOpen() {
//   this.emit('open')
//
//   this[ NS.connection ].on('message', this[ NS.onConnectionMessage ].bind( this ) )
//   this[ NS.connection ].on('close', this[ NS.onConnectionClose ].bind( this )  )
// }
//
// Client.prototype[ NS.onConnectionMessage ] = function onConnectionMessage( msg ) {
//
//   this.emit('message', msg )
// }
//
// Client.prototype[ NS.onConnectionClose ] = function onConnectionClose( err ) {
//
//   if ( this[ NS.connection ] ) {
//     this[ NS.connection ].removeAllListeners()
//     this.emit('close')
//   }
//
// }


module.exports = Client
