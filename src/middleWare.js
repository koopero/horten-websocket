'use strict'

const pathlib = require('path')
    , resolveModule = pathlib.resolve.bind( pathlib, __dirname, '..' )

const NS = require('./namespace')

module.exports = function middleWare ( server ) {
  const express = require('express')
      , app = express()
      , ws = require('express-ws')( app )

  app.ws('/horten-websocket', ( ws, req ) => {
      server[ NS.createConnection ]( ws, req )
    }
  )

  app.use('/horten-websocket/', express.static( resolveModule('build/' ) ) )
  app.use('/horten-websocket/', express.static( resolveModule('static/' ) ) )

  return app
}
