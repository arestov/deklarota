
import spv from '../../../spv'
import pvState from '../../provoda/state'
import _updateAttr from '../../_internal/_updateAttr'
import _updateRel from '../../_internal/_updateRel'
import getModelById from '../../utils/getModelById'
import getKey from './getKey'
import getSPByPathTemplate from '../../routes/legacy/getSPByPathTemplate'

export default function(request) {
  const self = this
  const requests_index = spv.cloneObj({}, pvState(self, 'spyglasses_requests'))

  const spyglass_key = getKey(request, self)
  const old_index = pvState(self, 'spyglasses_index') || {}
  const index = ensureSpyglass(self, old_index, spyglass_key, request)
  const spyglass = index[spyglass_key]

  requests_index[request.key] = spyglass

  if (old_index[spyglass_key] !== index[spyglass_key]) {
    const list = (self.getNesting('spyglasses') || []).slice()
    list.push(getModelById(self, spyglass))
    _updateRel(self, 'spyglasses', list)
  }

  _updateAttr(self, 'spyglasses_index', index)
  _updateAttr(self, 'spyglasses_requests', requests_index)
}

function ensureSpyglass(self, index, key, request) {
  if (index[key]) {
    return index
  }

  const path = request.name + ((key && key !== request.name) ? ('/' + key) : '')

  const spyglass = getSPByPathTemplate(self.app, self, 'router-' + path)

  const new_index = spv.cloneObj({}, index)

  new_index[key] = spyglass._provoda_id

  return new_index
}
