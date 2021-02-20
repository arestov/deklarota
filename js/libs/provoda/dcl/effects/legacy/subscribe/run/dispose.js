function disposeSubscribeEffects(self) {
  const _build_cache_interfaces = self.rt_schema._build_cache_interfaces
  if (_build_cache_interfaces == null) {
    return
  }

  for (var eff_key in _build_cache_interfaces) {
    if (!_build_cache_interfaces.hasOwnProperty(eff_key)) {
      continue
    }

    var dcl = _build_cache_interfaces[eff_key]
    var key = self.getInstanceKey() + '-' + dcl.id

    delete self._highway._subscribe_effect_handlers[key]
  }

}

export default disposeSubscribeEffects
