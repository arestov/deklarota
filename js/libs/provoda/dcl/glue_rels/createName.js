import { baseStringMin } from '../../utils/multiPath/asString'
const resourceStr = function(resource) {
  return resource.path || ''
}

const createName = function(addr) {
  return '__/internal/rels/' + baseStringMin(addr.from_base) + '/' + resourceStr(addr.resource) + '_/' + addr.nesting.path.join('__')
}

export default createName
