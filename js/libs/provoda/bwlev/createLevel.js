
import getBWlev from './getBWlev'

export default function createLevel(probe_name, num, parent_bwlev, md, map, freeze_parent_bwlev) {
  const bwlev = getBWlev(md, probe_name, parent_bwlev, num, map, freeze_parent_bwlev)
  bwlev.map = map
  return bwlev
}
