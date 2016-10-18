const test = require('./_test')
    , assert = test.assert
    , Loopin = test.Loopin

require('../client/polyfill')

describe('client', function () {
  const Client = require('../client/Client')

  it('will try to open and fail', function () {
    const client = new Client()

    var wasThrown = false
    return client.open( 'ws://:70000' )
    .catch( function( err ) {
      wasThrown = true
    } )
    .then( function () {
      assert( wasThrown )
    })
  })

  it('will be created automatically for tests', function () {
    const client = test.createClient()
    return client.close()
    .then( function () {
      
    })
  })
})
