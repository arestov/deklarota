import getRouteStepParent from './getRouteStepParent'
import getBwlevParent from './getBwlevParent'
import getBwlevMap from './getBwlevMap'

export default function isBigStep(cur, cur_child) {
  const map = getBwlevMap(cur)
  const bwlev_parent = getBwlevParent(cur)
  return bwlev_parent && bwlev_parent.getNesting('pioneer') != getRouteStepParent(map, cur_child)
};
