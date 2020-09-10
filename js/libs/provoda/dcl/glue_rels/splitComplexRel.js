import isRelAddr from '../../utils/multiPath/isRelAddr'
import cloneObj from '../../../spv/cloneObj'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import { createAddrByPart } from '../../utils/multiPath/parse'
import createName from './createName'

const splitComplexRel = function(addr) {
  if (!isRelAddr(addr) || (!addr.from_base.type && !addr.resource.path)) {
    return null
  }

  if (addr.resource.path) {
    throw new Error('implement glue source runtime for "route"')
  }

  var meta_relation = createName(addr)

  var result = cloneObj({}, addr)
  var destination = createUpdatedAddr(addr, {nesting: meta_relation, from_base: null})

  var source = createAddrByPart({
    from_base: addr.from_base,
    nesting: addr.nesting,
    resource: addr.resource,
  })

  var final_rel_addr = createAddrByPart({
    nesting: addr.nesting
  })

  result.splited = {
    destination: destination,
    meta_relation: meta_relation,
    source: source,
    final_rel_addr: final_rel_addr,
    final_rel_key: createName(final_rel_addr),
  }

  return result
}

export default splitComplexRel
