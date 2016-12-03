'use strict'

var HortenWebsocketClient = require('./HortenWebsocketClient')
var client = new HortenWebsocketClient()
client.open()
.then( function () {
  client.pull()
})
client.listening = true

global.__client = client

module.exports = client
