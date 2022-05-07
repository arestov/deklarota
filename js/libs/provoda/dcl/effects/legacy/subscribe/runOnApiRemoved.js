

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'

export default function(self, interface_name) {

  if (self.__fxs_subscribe_by_api?.hasOwnProperty(interface_name)) {
    return
  }

  const prev_values = {...self.__interfaces_to_subscribers_values}


  markApi(self, interface_name)

  const next_values = self.__interfaces_to_subscribers_values
  makeBindChanges(self, prev_values, next_values)
}
