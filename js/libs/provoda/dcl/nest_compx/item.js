
import spv from '../../../spv'
import NestWatch from '../../nest-watch/NestWatch'
import parseMultiPath from '../../utils/multiPath/parse'
import asString from '../../utils/multiPath/asString'
import zip_fns from '../../utils/zip/nest-compx'
import handler from './handler'
var hnest = handler.hnest
var hnest_state = handler.hnest_state

var simpleAddrToUse = function(addr, string) {
  if (!addr) {
    throw new Error('cant parse: ' + string)
    return null
  }

  if (addr.base_itself) {
    return addr
  }

  if (addr.result_type !== 'nesting' && addr.result_type !== 'state') {
    if (!addr.resource || !addr.resource.path) {
      return addr
    }
    throw new Error('implement runner part')
  }

  if (!addr.nesting || !addr.nesting.path) {
    return addr
  }


  if (!addr.zip_name) {
    throw new Error('zip name `@one:` or `@all:` should be provided for: ' + string)
  }

}

var getDeps = spv.memorize(function getEncodedState(string) {

  var result = parseMultiPath(string)
  var simple_addr = simpleAddrToUse(result, string)
  if (simple_addr != null) {
    return simple_addr
  }

  var copy = spv.cloneObj({}, result)

  var state_name = result.state && result.state.path

  var nwatch = new NestWatch(result, state_name, {
    onchd_state: hnest_state,
    onchd_count: hnest,
  })

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

  // for prefill
  this.raw_deps = list

  // for cache keys
  this.deps = list.map(asString)

  this.calcFn = fn || same

  // will be used by runner (to init watchers)
  this.parsed_deps = groupBySubscribing(list)

}

export default NestCompxDcl
