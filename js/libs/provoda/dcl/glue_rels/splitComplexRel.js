import isRelAddr from '../../utils/multiPath/isRelAddr'
import cloneObj from '../../../spv/cloneObj'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import { createAddrByPart } from '../../utils/multiPath/parse'
import createName from './createName'

export const doRelSplit = function(addr) {
  // ONLY nesting + from_base + resource
  var source = createAddrByPart({
    from_base: addr.from_base,
    nesting: addr.nesting,
    resource: addr.resource,
  })

  var meta_relation = createName(source)

  // COPY original addr, but replace nesting + from_base + resource
  var destination = createUpdatedAddr(addr, {
    nesting: meta_relation,
    from_base: null,
    resource: null,
  })


  // ONLY nesting
  var final_rel_addr = createAddrByPart({
    nesting: addr.nesting
  })

  return {
    destination: destination, // simplified original
    meta_relation: meta_relation, // key for original
    source: source, // complex part (for original)
    final_rel_addr: final_rel_addr, // most simple part. for ascendor
    final_rel_key: createName(final_rel_addr), // key of ascendor (subscribe to it)
  }
}

const splitComplexRel = function(addr) {
  if (!isRelAddr(addr) || (!addr.from_base.type && !addr.resource.path)) {
    return null
  }

  if (addr.resource.path) {
    throw new Error('implement glue source runtime for "route"')
  }


  var result = cloneObj({}, addr)
  var splited = doRelSplit(addr)

  result.splited = splited

  return result
}

export default splitComplexRel
