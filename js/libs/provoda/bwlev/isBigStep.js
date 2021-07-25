import getRouteStepParent from './getRouteStepParent'

export default function isBigStep(cur, cur_child) {
  const map = cur.map
  return cur.map_parent && cur.map_parent.getNesting('pioneer') != getRouteStepParent(map, cur_child)
};
