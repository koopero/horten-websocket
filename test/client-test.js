var test = require('./_test')
    , assert = test.assert

require('../src/polyfill')

describe('client', function () {
  var Client = require('../src/Client')

  it('will try to open and fail', function () {
    var client = new Client()

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
    var client = test.createClient()
    return client.close()
    .then( function () {

    })
  })
})
