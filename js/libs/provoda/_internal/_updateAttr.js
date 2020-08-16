
var updateProxy = require('../updateProxy')
var update = updateProxy.update

function updateAttr(self, name, value) {
  if (self._currentMotivator() == null) {
    throw new Error('wrap updateAttr call in `.input()`')
  }

  update(self, name, value)
}
export default updateAttr
