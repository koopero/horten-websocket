const HortenWebsocketClient = require('./HortenWebsocketClient')
const client = new HortenWebsocketClient()
client.open()
.then( function () {
  client.pull()
})
client.listening = true

global.__client = client

module.exports = client
