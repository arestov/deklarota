
import getSTEVNameLight from '../internal_events/light_attr_change/getNameByAttr'

export default {
  getSTEVNameLight: getSTEVNameLight,
  wipeObj: function(obj) {
    if (obj == null) {
      return obj
    }

    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        delete obj[p]
      }
    }

    return obj
  },
  nullObjValues: function(obj) {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        obj[p] = null
      }
    }
  },
}
