define(function(require) {
'use strict';

var markApi = require('./run/markApi')
var makeBindChanges = require('./run/makeBindChanges')

return function(self, using_raw, interface_name, values_original) {
  var using = using_raw
  using = self._interfaces_using = markApi(self._interfaces_to_states_index, using, interface_name, false);
  using = self._interfaces_using = makeBindChanges(self, self._build_cache_interfaces, using, values_original);
  return using
}

})
