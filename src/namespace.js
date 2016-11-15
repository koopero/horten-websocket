const NS = exports

NS.DEFAULT_PORT = 4000

NS.verbose = Symbol()
NS.connection = Symbol()
NS.connections = Symbol()
NS.target = Symbol()
NS.listeners = Symbol()

NS.closingPromise = Symbol()
NS.setConnection = Symbol()
NS.createConnection = Symbol()
NS.onClientMessage = Symbol()
NS.onClientEvent = Symbol()

NS.onDelta = Symbol()
NS.closeConnection = Symbol()

NS._openingPromise = Symbol()
NS.onConnectionOpen = Symbol()
NS.onConnectionMessage = Symbol()
NS.onConnectionClose = Symbol()
NS.onClientMessage = Symbol()
NS.onClientError = Symbol()

NS.onWebSocketMessage = Symbol()
NS.onMessage = Symbol()
NS.onError = Symbol()
NS.onClose = Symbol()
NS.middleWare = Symbol()

NS.tick = Symbol()
