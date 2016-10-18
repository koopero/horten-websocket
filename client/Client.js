'use strict'

const NS = require('../common/namespace')
    , Connection = require('../common/Connection')

const H = require('horten')
    , Promise = require('bluebird')

class Client extends Connection {

  open ( url ) {
    url = url || 0

    if ( 'number' == typeof url  ) {
      url = url || 4000
      url = 'ws://localhost:'+url
    }

    const self = this
        , opt = {}

    self._id = '_client'

    var promise = self[ NS.openingPromise ]

    promise = new Promise( function ( resolve, reject ) {
      // console.log('open.forReal', url )
      const connection = new WebSocket( url )
      connection.once('open', function() {
        self[ NS.setConnection ]( connection )
        resolve( self )
      } )

      connection.once('error', function ( err ) {
        connection.removeAllListeners()
        reject( err )
      })
    })

    if ( opt.pull )
      promise = promise.then( function () {
        pull()
      } )

    promise = promise.then( function () {
      self[ NS.openingPromise] = null
    })

    self[ NS.openingPromise ] = promise

    return promise
  }

  close( ) {
    const self = this

    if ( self[ NS.closingPromise ] ) {
      console.error('bailing closingPromise')
      return self[ NS.closingPromise ]
    }

    const connection = self[ NS.connection ]

    if ( !connection )
      return Promise.resolve()

    return self[ NS.closingPromise ] = Promise.fromCallback( function ( cb ) {
      console.log('client.close?')

      connection.close()
      setTimeout( cb, 20 )
    })
    .then( () => {
      self[ NS.connection ] = null
      self[ NS.closingPromise ] = null
      console.log('client.close!')
      self.emit('close')
    })
  }
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
