'use strict'

const NS = exports
NS.DEFAULT_PORT = 4000
const keys = [
  'verbose',
  'connection',
  'connections',
  'target',
  'listeners',
  'closingPromise',
  'server',
  'setConnection',
  'setStatus',
  'createConnection',
  'onClientMessage',
  'onClientEvent',
  'onDelta',
  'closeConnection',
  '_openingPromise',
  'onConnectionOpen',
  'onConnectionMessage',
  'onConnectionClose',
  'onClientMessage',
  'onClientError',
  'onWebSocketMessage',
  'onMessage',
  'onError',
  'onClose',
  'middleWare',
  'tick',
]

keys.forEach( ( key ) =>
  NS[key] = Symbol( key )
)
