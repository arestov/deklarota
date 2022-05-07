

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, interface_name) {
  let using = self.__interfaces_to_subscribers
  const values_original = {...using.values}

  using = self.__interfaces_to_subscribers = markApi(self, self.__fxs_subscribe_by_api, using, interface_name)
  using = self.__interfaces_to_subscribers = makeBindChanges(self, self.__fxs_subscribe_by_name, using, values_original)
  return using
}
