const Client = require('../src/Client')

global.HortenWebsocketClient = global.HortenWebsocketClient || Client

module.exports = Client
