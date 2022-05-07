

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, using_raw, interface_name) {
  const values_original = {...using_raw.values}

  let using = using_raw
  using = self.__interfaces_to_subscribers = markApi(self, self.__fxs_subscribe_by_api, using, interface_name)
  using = self.__interfaces_to_subscribers = makeBindChanges(self, self.__fxs_subscribe_by_name, using, values_original)
  return using
}
