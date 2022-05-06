
import AttrsCollector from '../AttrsOwner/AttrsCollector'
import definedAttrs from './definedAttrs'

export default function(self) {
  const atrrs_collector_key = self.mpx.__getBhvId() + '_' + self.constr_id
  self._highway._view_attr_collectors = self._highway._view_attr_collectors || {}
  self._highway._view_attr_collectors[atrrs_collector_key] = self._highway._view_attr_collectors[atrrs_collector_key] || new AttrsCollector(definedAttrs(self))

  self._attrs_collector = self._highway._view_attr_collectors[atrrs_collector_key]
}
