import initBWlev from './initBWlev'
import { getNestingConstr } from '../structure/get_constr'
import getModelById from '../utils/getModelById'

const getConstr = function(map, model_name) {
  const full_rel_name = 'bwlev-' + model_name
  return getNestingConstr(map.app, map, full_rel_name)
}

export default function getBWlev(md, probe_name, parent_bwlev, map_level_num, map, freeze_parent_bwlev) {
  const cache = parent_bwlev && parent_bwlev.getAttr('children_bwlevs_by_pioneer_id')
  const key = md._node_id
  const cached = cache && cache[key] && getModelById(md, cache[key])
  if (cached) {
    return cached
  }

  if (!map) {
    throw new Error('map should be provided')
  }

  const Constr = getConstr(map, md.model_name) || getConstr(map, '$default')
  if (!Constr) {
    throw new Error('can\'t get Constr')
  }
  const bwlev = initBWlev(Constr, md, probe_name, map_level_num, map, parent_bwlev, freeze_parent_bwlev)

  if (cache) {
    parent_bwlev.updateAttr('children_bwlevs_by_pioneer_id', {
      ...cache,
      [key]: bwlev._node_id
    })
  };

  return bwlev
}
