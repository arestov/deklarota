
import updateProxy from '../updateProxy'
import assertAttrUpdating from './assertAttrUpdating'

function _updateAttrsByChanges(self, changes) {
  assertAttrUpdating(self)

  updateProxy(self, changes)
}
export default _updateAttrsByChanges
