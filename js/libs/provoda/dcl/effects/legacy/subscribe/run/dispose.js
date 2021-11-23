function disposeSubscribeEffects(self) {
  if (self._build_cache_interfaces == null) {
    return
  }

  for (const eff_key in self._build_cache_interfaces) {
    if (!self._build_cache_interfaces.hasOwnProperty(eff_key)) {
      continue
    }

    const dcl = self._build_cache_interfaces[eff_key]
    const key = self.getInstanceKey() + '-' + dcl.id

    delete self._highway._subscribe_effect_handlers[key]
  }

}

export default disposeSubscribeEffects
