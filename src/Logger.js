'use strict'

const EVENTS = [
  'listen',
  'open',
  'close',
  'message',
  'send'
]

const NS = require('./namespace')

const treebird = require('treebird')

class Logger {

  event( eventName ) {
    const data = arguments.length == 2 ?
            arguments[1]
            : arguments.length > 2 ?
            Array.prototype.slice.call( arguments, 1 )
            : {}
        , target = this[NS.target] || {}
        , name = this.name || target.name
    treebird( data, eventName, name )
  }

  set target( newTarget ) {
    const self = this

    var target = self[NS.target]
      , listeners = self[NS.listeners]

    if ( target && listeners ) {
      for ( var eventName in listeners ) {
        target.removeListener( eventName, listeners[ eventName ] )
      }
    }

    target = newTarget

    if ( target ) {
      if ( !listeners ) {
        listeners = {}
        EVENTS.forEach(
          ( eventName ) =>
            listeners[ eventName ] = self.event.bind( self, eventName )
        )
      }

      for ( var eventName in listeners ) {
        target.addListener( eventName, listeners[ eventName ] )
      }
    }

    self[NS.target] = target
    self[NS.listeners] = listeners
  }

  get target() {
    return this[ NS.target ]
  }
}

module.exports = Logger
