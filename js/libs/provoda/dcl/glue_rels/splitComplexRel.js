import isRelAddr from '../../utils/multiPath/isRelAddr'
import { baseStringMin } from '../../utils/multiPath/asString'
import cloneObj from '../../../spv/cloneObj'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import { createAddrByPart } from '../../utils/multiPath/parse'


const resourceStr = function(resource) {
  return resource.path || ''
}

export const createName = function(addr) {
  return '__/internal/rels/' + baseStringMin(addr.from_base) + '/' + resourceStr(addr.resource) + '_/' + addr.nesting.path.join('__')
}

const splitComplexRel = function(addr) {
  if (!isRelAddr(addr) || (!addr.from_base.type && !addr.resource.path)) {
    return null
  }

  if (addr.resource.path) {
    throw new Error('implement glue source runtime for "route"')
  }

  var meta_relation = createName(addr)

  var result = cloneObj({}, addr)
  var destination = createUpdatedAddr(
    createUpdatedAddr(addr, 'nesting', meta_relation),
    'from_base',
    null
  )

  var source = {
    from_base: addr.from_base,
    nesting: addr.nesting,
    resource: addr.resource,
  }

  var final_rel_addr = createAddrByPart('nesting', source.nesting)

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
