exports.NS = require('./src/namespace')
exports.Server = require('./src/Server')
exports.Client = require('./src/Client')
exports.Logger = require('./src/Logger')

const resolve = require('path').resolve
exports.staticDir = resolve( __dirname, 'build' )
