var test = require('./_test')
    , assert = test.assert

describe('server', function () {
  var Server = require('../src/Server')

  it('will open and close', function () {
    var server = new Server()

    var listenPromise = server.listen( 4000 )
    assert.isFunction ( listenPromise.then )

    return listenPromise
    .then( () => server.close() )
  })

  it('will be created automatically for tests', function () {
    var server = test.createServer()
    return server.listen( 50000 )
    .then( () => server.close() )
  })
})
