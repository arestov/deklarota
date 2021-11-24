import getRouteStepParent from './getRouteStepParent'
import getBwlevParent from './getBwlevParent'

export default function isBigStep(cur, cur_child) {
  const map = cur.map
  const bwlev_parent = getBwlevParent(cur)
  return bwlev_parent && bwlev_parent.getNesting('pioneer') != getRouteStepParent(map, cur_child)
};
