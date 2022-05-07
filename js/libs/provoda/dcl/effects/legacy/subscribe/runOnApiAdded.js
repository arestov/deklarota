

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, using_raw, interface_name, values_original2) {
  let using = using_raw

  using = self.__interfaces_to_subscribers = markApi(self.__fxs_subscribe_by_api, using, interface_name, true)
  using = self.__interfaces_to_subscribers = makeBindChanges(self, self.__fxs_subscribe_by_name, using, values_original2)

  return using
}
