'use strict'


var Message = module.exports

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




// var H = require('horten')
//
// Message.parse = function ( msg ) {
//   try {
//     msg = JSON.parse( msg )
//   } catch ( e ) {
//     return {
//       error: e
//     }
//   }
//
//   return msg
// }
//
// Message.read = function () {
//   return Message( 'read', null, H.path.resolve( arguments ) )
// }
//
// function Message ( type, data, path__) {
//   var path = H.path.slice( arguments, 2 )
//
//   return {
//     type: type,
//     data: data,
//     path: H.path.resolve( path )
//   }
//
// }
