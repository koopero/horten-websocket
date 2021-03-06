'use strict'

const test = require('./_test')
    , assert = test.assert
    , Promise = require('bluebird')
    , H = require('horten')

require('../src/polyfill')

describe('server + client', function () {
  it('will be created automatically for tests', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client

    return both.open()
    .then( both.close )
  })


  it('will pass a message from client to server', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , mesg = { foo: 'bar' }

    return both.open()
    .then( () => Promise.fromCallback( function ( cb ) {
      server.once('message', function ( message ) {
        assert.deepEqual( message, mesg )
        cb()
      })

      client.send( mesg )
    }))
    .then( both.close )
  })

  it('will pass a message from server to client', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , serverMessage = { foo: 'bar' }

    return both.open()
    .then( () => Promise.fromCallback( function ( cb ) {
      client.once('message', function ( clientMessage ) {
        assert.deepEqual( clientMessage, serverMessage )
        cb()
      })

      server.send( serverMessage )
    }))
    .then( both.close )
  })

  it('client will take state from server', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , path = test.path()
        , data = { foo: 'bar' }

    server.patch( data, path )

    assert.deepEqual( server.get(), H.wrap( data, path ) )

    return both.open()
    .then( () => client.pull() )
    .then( ( result ) => assert.deepEqual( result, H.wrap( data, path ) ) )
    .then( () => assert.deepEqual( client.root.get( path ), data ) )
    .then( both.close )
    .catch( ( e ) => {
      both.close()
      throw e
    } )
  })

  it('client will patch server', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , data = { foo: 'ba222' }


    return both.open()
    .then( () => client.mutant.patch( data ) )
    .then( () => test.waitFor( 'deltaRemote', server ) )
    .then( ( result ) => assert.deepEqual( result, data ) )
    .then( () => assert.deepEqual( server.get(), data ) )
    .then( both.close )
  })

  it('server will patch client', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , data = { foo: 'baz' }

    return both.open()
    .then( () => server.mutant.patch( data ) )
    .then( () => test.waitFor( 'value', client ) )
    .then( ( result ) => assert.deepEqual( H.unset( result, '_local' ), data ) )
    .then( () => assert.deepEqual( H.unset( client.get(), '_local' ), data ) )
    // .delay( 1000 )
    .then( both.close )
  })

  it('server will not echo', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , data = { foo: 'baz' }

    return both.open()
    .then( () => client.mutant.patch( data ) )
    .then( () => test.shouldNotFire( 'send', server  ) )
    .then( both.close )
    .catch( ( e ) => {
      both.close()
      throw e
    } )
  })

  it('client will not echo', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , data = { foo: 'baz' }

    return both.open()
    .then( () => server.mutant.patch( data ) )
    .then( () => test.shouldNotFire( 'message', server  ) )
    .then( both.close )
    .catch( ( e ) => {
      both.close()
      throw e
    } )
  })

  it('server will trace', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , data = test.data()

    new H.Tracer( {
      root: server.root,
      listening: true
    })

    return both.open()
    .then( () => client.mutant.patch( data ) )
    .delay( 500 )
    .then( both.close )
  })

  it('client will trace status', function () {
    const both = test.createClientServer()
        , server = both.server
        , client = both.client
        , data = test.data()

    new H.Tracer( {
      root: client.root,
      path: '_local/websocket',
      listening: true
    })

    return both.open()
    .then( () => client.mutant.patch( data ) )
    .delay( 500 )
    .then( both.close )
  })

})
