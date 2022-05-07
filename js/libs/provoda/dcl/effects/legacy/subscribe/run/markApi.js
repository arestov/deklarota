
// state_name в данном контексте просто key (за исключенимем момента когда нужно вызвать getStateUpdater)

const gotAllApis = function(self, dcl) {

  for (let i = 0; i < dcl.apis.length; i++) {
    const value = Boolean(self.getInterface(dcl.apis[i]))
    if (!value) {
      return false
    }
  }

  return true
}

const markApi = function(self, index, interface_name) {
  const fsx_list = index && index[interface_name]
  if (!fsx_list || !fsx_list.length) {
    return
  }

  if (!self.__interfaces_to_subscribers_values) {
    self.__interfaces_to_subscribers_values = {}
  }
  const values = self.__interfaces_to_subscribers_values

  for (let i = 0; i < fsx_list.length; i++) {
    const cur = fsx_list[i]
    // calc final value for fsx_list of deps
    values[cur.key] = gotAllApis(self, cur)
  }
}

export default markApi
