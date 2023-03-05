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


  /*
    TODO: check if we should do something with __interfaces_to_subscribers_removers_by_name_by_node_id
    or useInterface(name, null) does everything already
  */
}

export default disposeSubscribeEffects
