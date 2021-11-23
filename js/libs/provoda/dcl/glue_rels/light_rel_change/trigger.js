import getNameByValue from './getNameByValue'

function triggerLightRelChange(self, rel_key, value) {
  const light_name = getNameByValue(rel_key)

  const light_cb_cs = self.evcompanion.getMatchedCallbacks(light_name)

  if (light_cb_cs == null || !light_cb_cs.length) {
    return
  }

  self.evcompanion.triggerCallbacks(light_cb_cs, false, false, light_name, value)
}


export default triggerLightRelChange
