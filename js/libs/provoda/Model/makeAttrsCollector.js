
import AttrsCollector from '../AttrsOwner/AttrsCollector'
import definedAttrs from './definedAttrs'

export default function(self) {
  if (!self.constructor.prototype.hasOwnProperty('_attrs_collector')) {
    // ensure that prototype has AttrsCollector
    self.constructor.prototype._attrs_collector = new AttrsCollector(definedAttrs(self.constructor.prototype))
    return
  }

  // from prototype to instance
  self._attrs_collector = self._attrs_collector
}
