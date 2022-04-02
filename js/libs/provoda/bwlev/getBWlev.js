import initBWlev from './initBWlev'
import { getNestingConstr } from '../structure/get_constr'

const getConstr = function(map, model_name) {
  const full_rel_name = 'bwlev-' + model_name
  return getNestingConstr(map.app, map, full_rel_name)
}

export default function getBWlev(md, probe_name, parent_bwlev, map_level_num, map, freeze_parent_bwlev) {
  const cache = parent_bwlev && parent_bwlev.children_bwlevs
  const key = md._provoda_id
  if (cache && cache[key]) {
    return cache[key]
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
    cache[key] = bwlev
  };

  return bwlev
}
