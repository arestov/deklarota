import getRouteStepParent from './getRouteStepParent'

const isStart = (map, md) => {
  const cur = md
  while (cur) {
    if (map.mainLevelResident == cur) {
      return true
    }

    const parent = getRouteStepParent(map, cur)
    if (parent == null && map.getAttr('works_without_main_resident')) {
      return true
    }

    return false
  }
}

export default isStart
