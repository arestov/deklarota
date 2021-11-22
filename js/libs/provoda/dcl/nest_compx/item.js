import spv from '../../../spv'
import cloneObj from '../../../spv/cloneObj'

import parseMultiPath from '../../utils/multiPath/parse'
import splitComplexRel from '../glue_rels/splitComplexRel'
import asString from '../../utils/multiPath/asString'
import isRelAddr from '../../utils/multiPath/isRelAddr'
import CompxAttrDecl from '../attrs/comp/item'
import relShape from '../nests/relShape'

var simpleAddrToUse = function(addr, string) {
  if (!addr) {
    throw new Error('cant parse: ' + string)
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

  var result = cloneObj({}, splitComplexRel(result) || result)
  result.nwatch = true
  return result
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
    } else if (cur.nwatch || isRelAddr(cur)) {
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

var getGlueSources = function(list) {
  var result = []
  for (var i = 0; i < list.length; i++) {
    var addr = list[i]
    if (addr.splited == null) {
      continue
    }

    result.push(Object.freeze({
      meta_relation: addr.splited.meta_relation,
      source: addr.splited.source,
      final_rel_addr: addr.splited.final_rel_addr,
      final_rel_key: addr.splited.final_rel_key,
    }))
  }

  return Object.freeze(result)
}

var useDesination = function(addr) {
  if (addr.splited == null) {
    return addr
  }

  return addr.splited.destination
}


var NestCompxDcl = function(name, data) {
  var fn = typeof data[2] == 'function' ? data[2] : null

  this.calcFn = fn || same

  this.dest_name = name

  var deps = data[1]
  var list = deps.map(getDeps)

  this.glue_sources = Object.freeze(getGlueSources(list))

  // for prefill
  this.raw_deps = Object.freeze(list)

  this.rel_shape = relShape(typeof data[2] == 'function' ? data[3] : data[2])

  if (!this.rel_shape) {
    throw new Error('rel_shape is required')
  }


  var prepared_to_run = list.map(useDesination)
  // for cache keys
  this.deps = Object.freeze(prepared_to_run.map(asString))
  // will be used by runner (to init watchers)
  this.parsed_deps = Object.freeze(groupBySubscribing(prepared_to_run))


  var rel_name = '__/internal/rels//_/' + this.dest_name

  this.comp_attr = new CompxAttrDecl(rel_name, [
    this.deps,
    this.calcFn,
  ])

}

export default NestCompxDcl
