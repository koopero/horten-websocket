'use strict'
module.exports = loopinWebSocketServer

// loopinWebSocketServer.options = require('boptions')({
//   open: 0
// })

const Connection = require('./Connection')
    , Responder = require('../common/Responder')
    , Message = require('../common/Message')


const express = require('express')

const EventEmitter = require('events');

class Emitter extends EventEmitter {}

function loopinWebSocketServer() {
  const loopin = this
      , Promise = loopin.Promise
      , self = new Emitter()
      , opt = loopinWebSocketServer.options( arguments )
      , path = 'websocket/server/'
      , responder = Responder.call( loopin, self )

  loopin.plugin('hook')
  loopin.hookAdd('patch', onLoopinPatch )
  loopin.hookAdd('close', close )

  loopin.websocket = self

  const emitter = new Emitter()
  emitter.connectionRemove = connectionRemove
  emitter.connectionMessage = connectionMessage

  self.app = createApp()
  self.open = open
  self.send = send
  self.close = close

  var _server
    , _connections = []


  return self

  function log( type, data ) {
    loopin.log( type, path, { data: data } )
  }

  function close() {
    return Promise.resolve( _connections )
    .map( connection => connection && connection.close() )
    .tap( function () {
      const closeServer = _server
      _server = null

      if ( closeServer ) {
        return Promise.fromCallback( ( cb ) => closeServer.close( cb ) )
      }
    })
    .tap( () => loopin.log( 'close', path ) )
  }

  function send( mesg ) {
    if ( 'string' != typeof mesg )
      mesg = JSON.stringify( mesg )

    return Promise.resolve( _connections )
    .map( connection => connection.send( mesg ) )
  }


  function open( port ) {
    return Promise.fromCallback( function ( cb ) {
      if ( _server )
        _server.close()

      self.app = self.app || createApp()
      loopin.log( 'open', path, { data: { port: port } } )
      _server = self.app.listen( port, cb )
    })
  }

  function createApp() {
    const app = express()
        , appWs = require('express-ws')( app )

    app.ws('/', ( ws, req ) => createConnection( ws, req ) )

    return app
  }

  function createConnection( ws, req ) {
    const path = connectionPath( req )
        , connection = Connection.call( loopin, emitter, path, ws, req )

    _connections.push( connection )
  }

  function connectionRemove( connection ) {
    var ind
    while ( ( ind = _connections.indexOf( connection ) ) != -1 )
      _connections.splice( ind, 1 )
  }

  function connectionMessage( connection, msg ) {
    log( 'message', msg )
    self.emit('message', msg )

    const response = responder.message( msg )

    if ( response ) {
      connection.send( response )
    }

  }

  function connectionPath( req ) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    return loopin.pathResolve( path, 'client', ip )
  }

}
