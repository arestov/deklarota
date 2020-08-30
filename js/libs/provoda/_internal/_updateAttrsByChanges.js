
import updateProxy from '../updateProxy'


function _updateAttrsByChanges(self, changes) {
  if (self._currentMotivator() == null) {
    throw new Error('wrap updateAttr call in `.input()`')
  }

  updateProxy(self, changes)
}
export default _updateAttrsByChanges
