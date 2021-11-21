import getRouteStepParent from './getRouteStepParent'

const isStart = (map, md) => {
  var cur = md
  while (cur) {
    if (map.mainLevelResident == cur) {
      return true
    }

    var parent = getRouteStepParent(map, cur)

    if (parent && parent._x_skip_navigation) {
      cur = parent
      continue
    }

    return false
  }
}

export default isStart
