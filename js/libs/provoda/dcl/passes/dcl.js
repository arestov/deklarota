define(function(require){
'use strict';
var spv = require('spv')
var parseMultiPath = require('../../utils/multiPath/parse')
var noop = require('./noop')
var now = require('./deps/now')
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

var targetData = function(to, result_name, dsl_options) {
  if (!Array.isArray(to)) {
    throw new Error('to: should be array ' + to)
  }
  var target_path = to[0];
  var options = to[1];
  var parsed_path = parseMultiPath(target_path, true)

  if (parsed_path.result_type != 'nesting' && parsed_path.result_type != 'state') {
    throw new Error('we can put result to nesting or state only')
  }

  if (parsed_path.result_type === 'nesting' && (!options || !options.method)) {
    throw new Error('use options.method to describe how to save relation')
  }

  if (dsl_options && dsl_options.warn) {
    if (parsed_path.result_type == 'nesting' && (!options || !options.schema)) {
      console.warn('implement schema parsing. add schema to pass dcl')
    }
  }

  return {
    path_type: target_path == '*' ? 'by_provoda_id' : 'by_path',
    value_by_name: result_name ? true : false,
    target_path: parsed_path,
    options: options,
    result_name: result_name,
  }
}

var targetsList = function(byName) {
  var result = [];
  for (var name in byName) {
    if (!byName.hasOwnProperty(name)) {
      continue;
    }
    result.push(targetData(byName[name], name))
  }
  return result;
}

var empty = [];

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

    var cur = parseMultiPath(deps[i], true);
    result[i] = cur

    if (cur.nesting && cur.nesting.path && !cur.zip_name) {
      throw new Error('zip name `@one:` or `@all:` should be provided for: ' + deps[i])
    }

  }
  return result;
}

function targetedResult(self, to) {
  self.by_named_result = !Array.isArray(to)

  self.targeted_results_list = null;
  self.targeted_single_result = null;

  if (self.by_named_result) {
    self.targeted_results_list = targetsList(to)
  } else {
    self.targeted_single_result = targetData(to)
  }
}

var PassDcl = function(name, data) {
  this.name = name;

  targetedResult(this, data.to)

  this.deps = null
  this.fn = null

  if (typeof data.fn === 'function') {
    this.fn = data.fn
  } else {
    this.deps = getDeps(data.fn[0]);
    this.fn = data.fn[1];
  }

}

return PassDcl;
})
