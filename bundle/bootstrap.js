'use strict'

const H = require('horten')

new H.Tracer( {
  name: 'horten-websocket/bootstrap',
  listening: true,
  path: '_local/websocket'
})

const HortenWebsocketClient = require('./HortenWebsocketClient')
const client = new HortenWebsocketClient( {
  root: H.root,
  retry: true,
  pullOnOpen: true
})

client.open()
client.listening = true
client.H = H



global.__client = client
module.exports = client
