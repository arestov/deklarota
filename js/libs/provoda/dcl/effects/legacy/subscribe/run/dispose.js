function disposeSubscribeEffects(self) {
  if (self._build_cache_interfaces == null) {
    return
  }

  for (var eff_key in self._build_cache_interfaces) {
    if (!self._build_cache_interfaces.hasOwnProperty(eff_key)) {
      continue
    }

    var dcl = self._build_cache_interfaces[eff_key]
    var key = self.getInstanceKey() + '-' + dcl.id

    delete self._highway._subscribe_effect_handlers[key]
  }

}

export default disposeSubscribeEffects
