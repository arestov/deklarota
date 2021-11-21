import getRouteStepParent from './getRouteStepParent'

const isStart = (map, md) => {
  var cur = md
  while (cur) {
    if (cur.map_level_num == -1) {
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
