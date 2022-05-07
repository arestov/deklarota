

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, interface_name) {

  if (self.__fxs_subscribe_by_api?.hasOwnProperty(interface_name)) {
    return
  }

  const values_original = {...self.__interfaces_to_subscribers_values}

  markApi(self, interface_name)
  makeBindChanges(self, values_original)
}
