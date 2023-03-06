function validateDisposedRemovers() {
    /*
    useInterface(name, null) should clean everything already
  */
  const self = this
  const removers = self._highway.__interfaces_to_subscribers_removers_by_name_by_node_id

  for (const key of removers.keys()) {
    if (removers.get(key).has(self.getInstanceKey())) {
      throw new Error('useInterface did not clean subscribe removers')
    }
  }
}
function disposeSubscribeEffects(self) {
  if (self.__fxs_subscribe_by_name == null) {
    return
  }

  if (self._highway._subscribe_effect_handlers == null) {
    return
  }

  for (const eff_key in self.__fxs_subscribe_by_name) {
    if (!self.__fxs_subscribe_by_name.hasOwnProperty(eff_key)) {
      continue
    }

    const dcl = self.__fxs_subscribe_by_name[eff_key]
    const key = self.getInstanceKey() + '-' + dcl.id

    delete self._highway._subscribe_effect_handlers[key]
  }


  self.inputWithContext(validateDisposedRemovers, null);

}

export default disposeSubscribeEffects
