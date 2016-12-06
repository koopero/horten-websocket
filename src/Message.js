'use strict'

const Message = module.exports

Message.pull = function ( path ) {
  return {
    type: 'pull',
    path: path
  }
}

Message.delta = function ( delta ) {
  return {
    type: 'delta',
    data: delta
  }
}
