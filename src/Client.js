'use strict'

const NS = require('./namespace')
    , Connection = require('./Connection')

const H = require('horten')

class Client extends Connection {
  constructor( opt ) {
    super( opt )
    this.statusPass = '/_local/websocket'
  }

  open ( url ) {

    const self = this
        , opt = {}

    url = self.getURL( url )

    self._id = '_horten'

    self[ NS.setStatus ]( { readyState: 0, status: 'opening', url: url, open: false } )

    var promise = self[ NS.openingPromise ]
    promise = new Promise( function ( resolve, reject ) {
      var connection = new WebSocket( url )

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
      self[ NS.setStatus ]( { readyState: 1, status: 'open', error: null, open: true } )
      self.emit('open')
      self.listening = true
    })

    self[ NS.openingPromise ] = promise

    return promise
  }

  getURL( url ) {
    if ( 'number' == typeof url  ) {
      url = Math.max( 0, parseInt( url ) ) || NS.DEFAULT_PORT
      url = 'ws://localhost:'+url+'/horten-websocket'
    }

    if ( !url ) {
      const window = global.window

      if ( window ) {
        const loc = window.location

        if (loc.protocol === "https:") {
            url = "wss:";
        } else {
            url = "ws:";
        }

        url += "//" + loc.host;
        url += '/horten-websocket';
      }
    }

    return url
  }

}


Client.prototype[ NS.onWebSocketMessage ] = function ( message ) {
  this[ NS.onMessage ]( message.data )
}


module.exports = Client
