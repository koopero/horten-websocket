'use strict'
module.exports = loopinWebSocketClient

// loopinWebSocketClient.options = require('boptions')({
//   pull: true,
//   url: ''
// })

const H = require('horten')
    , Message = require('../common/Message')
    , Responder = require('../common/Responder')

function loopinWebSocketClient() {
  const loopin = this
      , Promise = loopin.Promise
      , opt = loopinWebSocketClient.options( arguments )
      , self = new loopin.EventEmitter()
      , path = 'websocket/client/'
      , echo = H.Echo()
      , responder = Responder.call( loopin, self )

  var _connection
  if ( opt.url )
    open( opt.url )

  loopin.plugin('hook')
  loopin.plugin('patch')

  loopin.websocket = self

  loopin.hookAdd('close', onLoopinClose )
  loopin.hookAdd('patch', onLoopinPatch )

  self.open = open
  self.pull = pull
  self.send = send
  self.close = close

  return self

  function log( type, data ) {
    loopin.log( type, path, { data: data } )
  }

  var _openingPromise
    , _openingUrl

  function open( url ) {
    url = url || 0

    if ( 'number' == typeof url  ) {
      url = url || 4000
      url = 'ws://127.0.0.1:'+url
    }

    _openingPromise = new Promise( function ( resolve, reject ) {
      _connection = new WebSocket( url )
      _connection.once('open', function() {
        onConnectionOpen()
        resolve( self )
      } )

      _connection.once('error', function ( err ) {
        _connection.removeAllListeners()
        reject( err )
      })
    })

    if ( opt.pull )
      _openingPromise = _openingPromise.then( function () {
        pull()
      } )

    _openingPromise = _openingPromise.then( function () {
      _openingPromise = null
    })

    return _openingPromise
  }

  function pull() {
    send( Message.read() )
    return Promise.fromCallback( function ( cb ) {
      self.once('readback', function ( data, path ) {
        loopin.patch( data, path )
        if ( path == '/' ) {
          cb( null, data )
        }
      })
    })
  }

  function send( msg ) {
    log( 'send', msg )
    msg = JSON.stringify( msg )
    _connection.send( msg )
  }

  function close() {
    loopin.hookRemove( 'close', onLoopinClose )
    loopin.hookRemove( 'patch', onLoopinPatch )
  }

  function onConnectionOpen() {
    self.emit('open')
    log('open')

    _connection.on('message', onConnectionMessage )
    _connection.on('close', onConnectionClose )
  }

  function onConnectionMessage( message ) {
    message = Message.parse( message )

    log('message', message )
    self.emit('message', message )

    const response = responder.message( message )

    if ( response ) {
      send( response )
    }
  }

  function onConnectionClose( ) {
    log('close')
  }

  function onLoopinPatch( value, path ) {
    const msg = Message( 'patch', value, path )
    send( msg )
  }

  function onLoopinClose() {

  }


}
