define(function(require) {
'use strict'
var spv = require('spv')
var NestWatch = require('../../nest-watch/NestWatch')
var parseMultiPath = require('../../utils/multiPath/parse')
var asString = require('../../utils/multiPath/asString')
var zip_fns = require('../../utils/zip/nest-compx')

var handler = require('./handler')
var hnest = handler.hnest
var hnest_state = handler.hnest_state

var getDeps = spv.memorize(function getEncodedState(string) {

  var result = parseMultiPath(string)

  if (!result) {
    throw new Error('cant parse: ' + string)
    return null
  }

  if (result.base_itself) {
    return result
  }

  if (result.result_type !== 'nesting' && result.result_type !== 'state') {
    if (!result.resource || !result.resource.path) {
      return result
    }
    throw new Error('implement runner part')
  }

  if (!result.nesting || !result.nesting.path) {
    return result
  }


  if (!result.zip_name) {
    throw new Error('zip name `@one:` or `@all:` should be provided for: ' + string)
  }


  var state_name = result.state && result.state.path

  var nwatch = new NestWatch(result, state_name, {
    onchd_state: hnest_state,
    onchd_count: hnest,
  })

  var copy = spv.cloneObj({}, result)
  copy.nwatch = nwatch

  var zip_name = result.zip_name || 'all'
  var zipFn = zip_fns[zip_name]
  copy.zipFn = zipFn

  return copy
})

var groupBySubscribing = function(list) {
  var result = {
    nest_watch: [],
    usual: [],
    static: [],
    self: false,
  }

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    if (cur.base_itself) {
      result.self = true
    } else if (cur.nwatch) {
      result.nest_watch.push(cur)
    } else {
      if (cur.result_type != 'state' && (!cur.resource || !cur.resource.path)) {
        // ascendors
        // parent/root
        result.static.push(cur)
      } else {
        result.usual.push(cur)
      }
    }
  }

  return result
}

var same = function(item) {
  return item
}

var NestCompxDcl = function(name, data) {
  this.dest_name = name

  var deps = data[1]
  var fn = data[2]

  var list = deps.map(getDeps)

  this.raw_deps = list

  this.deps = list.map(asString)

  this.calcFn = fn || same

  // will be used by runner
  this.parsed_deps = groupBySubscribing(list)

}

return NestCompxDcl
})
