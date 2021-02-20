

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, using_raw, interface_name, values_original) {
  var using = using_raw
  using = self._interfaces_binders = markApi(self.rt_schema._interfaces_to_states_index, using, interface_name, false)
  using = self._interfaces_binders = makeBindChanges(self, self.rt_schema._build_cache_interfaces, using, values_original)
  return using
}
