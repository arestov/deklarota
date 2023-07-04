
import { update } from '../updateProxy'
import assertAttrUpdating from './assertAttrUpdating'

function _updateAttr(self, name, value) {
  assertAttrUpdating(self)

  update(self, name, value)
}
export default _updateAttr
