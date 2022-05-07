

import markApi from './run/markApi'
import makeBindChanges from './run/makeBindChanges'


const template = function() {
  return {
    /*
      value - true, когда есть все нужные api
      при смене value для state происходит bind.
      при value === false происходит unbind
    */
    values: {},
    removers: {}
  }
}

export default function(self, interface_name) {
  if (!self.__interfaces_to_subscribers) {
    self.__interfaces_to_subscribers = template()
  }

  let using = self.__interfaces_to_subscribers
  const values_original2 = {...using.values}

  using = self.__interfaces_to_subscribers = markApi(self, self.__fxs_subscribe_by_api, using, interface_name)
  using = self.__interfaces_to_subscribers = makeBindChanges(self, self.__fxs_subscribe_by_name, using, values_original2)

  return using
}
