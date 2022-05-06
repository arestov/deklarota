

import getNameByAttr from './getNameByAttr'
//var st_event_name_default = ;
//var st_event_name_light = 'lgh_sch-';

function triggerLightAttrChange(self, attr_name, value) {
  // Only Views can have evcompanion
  if (self.evcompanion == null) {
    return
  }

  const light_name = getNameByAttr(attr_name)

  const light_cb_cs = self.evcompanion.getMatchedCallbacks(light_name)

  if (light_cb_cs == null || !light_cb_cs.length) {
    return
  }

  self.evcompanion.triggerCallbacks(light_cb_cs, false, false, value)
}


export default triggerLightAttrChange
