const test = require('./_test')
    , assert = test.assert
    , Loopin = test.Loopin

describe('server', function () {
  const Server = require('../server/Server')

  it('will open and close', function () {
    const server = new Server()

    const listenPromise = server.listen( 4000 )
    assert.isFunction ( listenPromise.then )

    return listenPromise
    .then( () => server.close() )
  })

  it('will be created automatically for tests', function () {
    const server = test.createServer()
    return server.listen( 50000 )
    .then( () => server.close() )
  })
})
