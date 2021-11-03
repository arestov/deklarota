
import parseMultiPath from '../../utils/multiPath/parse'
import noop from './noop'
import now from './deps/now'
import targetedResult from './targetedResult/dcl'
import RelShape from '../nests/relShape'
// var utils = require('../../utils/index.js');
// var getParsedState = utils.getParsedState

// SINGLE

// 'created_song': {
//   to: ['/playlists/:playlist_name/@songs_list', {
//     method: 'at_start' || 'at_end' || 'set_one' || 'replace' || 'at_index' || 'move_to',
//     model: Model,
//   }],
//   fn: [
//     ['dep1', 'dep2', 'dep3', '$'],
//     function(data, dep1, dep2, dep3, get) {
//       return []
//     }
//   ]
// },


// # MULTY

// 'nesting:some_nesting': {
//     to: {
//         '*': true, // works, but depricated
//         'next': [
//           'selected', {
//               // we can declare multiple targets. next and prev are nicknames. only to use it in answer/return
//               base: 'arg_nesting_next',
//               // target prop wil set target to next value of `some_nesting`
//               // `selected` is state name
//               // so `selected` will be changed to new value of `some_nesting`
//
//               // so: selected prop of next nesting:some_nesting can be setted by using `next` in answer
//           }
//         ],
//         'prev': [
//           'selected', {
//               base: 'arg_nesting_prev',
//               // `target` prop wil set target to prev value of `some_nesting`
//               // so `selected` will be changed to old value of `some_nesting`
//           }
//         ]
//     },
//     fn: function(data, $) {
//         return {
//             next: true, // Исполнитель должен проверить hasOwnProperty()
//             prev: false,
//             '*': {589592873598724: {nestings: {}, states: {}}}
//         }
//     }
// },


var empty = []

var getDeps = function(deps) {
  if (!deps || !deps.length) {
    return empty
  }

  var result = new Array(deps.length)
  for (var i = 0; i < deps.length; i++) {
    if (deps[i] === '$noop') {
      result[i] = noop
      continue
    }

    if (deps[i] === '$now') {
      result[i] = now
      continue
    }

    var cur = parseMultiPath(deps[i], true)
    result[i] = cur

    if (cur.nesting && cur.nesting.path && !cur.zip_name) {
      throw new Error('zip name `@one:` or `@all:` should be provided for: ' + deps[i])
    }

  }
  return result
}

function same(arg) {
  return arg
}

const actionOfRelChange = (name) => {
  if (!name.startsWith('handleRel:')) {
    return null
  }

  return name.replace('handleRel:', '')
}

var PassDcl = function(name, data) {
  this.name = name

  targetedResult(this, data.to)

  this.deps = null
  this.fn = same

  /*
    handleRel:some_rel.
    used to get proper rel_shape and validate it validateActionsDestinations
    (when options.base arg_nesting_* used)
    so you don't have to define rel_shape
  */
  this.rel_name = actionOfRelChange(name)

  /*
    way to define rel_shape
    when options.base arg_nesting_* used WITHOUT handleRel:some_rel
  */
  this.rel_shape = data.rel_shape ? RelShape(data.rel_shape) : null

  if (!data.fn) {
    return
  }

  if (typeof data.fn === 'function') {
    this.fn = data.fn
  } else if (Array.isArray(data.fn)) {
    this.deps = getDeps(data.fn[0])
    this.fn = data.fn[1]
  } else {
    throw new Error('unknow fn declaration')
  }

}

export default PassDcl
