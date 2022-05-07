function disposeSubscribeEffects(self) {
  if (self.__fxs_subscribe_by_name == null) {
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

}

export default disposeSubscribeEffects
