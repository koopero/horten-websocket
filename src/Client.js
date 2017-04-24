'use strict'

const NS = require('./namespace')
    , Connection = require('./Connection')

const H = require('horten')

class Client extends Connection {
  constructor( opt ) {
    super( opt )
    this.pullOnOpen = opt && opt.pullOnOpen === false ? false : true
    this.statusPass = '/_local/websocket'
  }

  open ( url ) {
    const self = this
        , opt = {}

    if ( self[ NS.openingPromise ] )
      return self[ NS.openingPromise ]

    url = self.getURL( url || self.url )

    self.url = url
    self._id = '_horten'

    self[ NS.setStatus ]( { readyState: 0, status: 'opening', url: url, open: false } )

    var promise = new Promise( function ( resolve, reject ) {
      self.once( 'open', () => resolve( self ) )
      self.once( 'error', ( err ) => reject( err ) )

      try {
        const connection = new WebSocket( url )
        self[ NS.setConnection ]( connection )
      } catch( err ) {
        onError( err )
      }

      function onError( err ) {
        if ( !self[ NS.retry ]() ) {
          reject( err )
        }
      }
    })
    .catch( ( err ) => {
      self[ NS.openingPromise] = null

      if ( !self[ NS.retry ]() ) {
        throw err
      }
    })

    if ( opt.pullOnOpen )
      promise = promise.then( function () {
        return new Promise( function ( resolve ) {
          self.on('pull', ( data ) => resolve( data ) )
        })
      } )

    promise = promise.then( function ( data ) {
      self[ NS.openingPromise] = null
      self[ NS.setStatus ]( { readyState: 1, status: 'open', error: null, open: true } )
      self.emit('open')
      self.listening = true
      return data || self
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
