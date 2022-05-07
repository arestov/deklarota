

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, interface_name) {
  if (!self.__fxs_subscribe_by_api?.hasOwnProperty(interface_name)) {
    return
  }


  const values_original2 = {...self.__interfaces_to_subscribers_values}

  markApi(self, self.__fxs_subscribe_by_api, interface_name)
  makeBindChanges(self, values_original2)
}
