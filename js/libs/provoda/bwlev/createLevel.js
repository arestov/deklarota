
import getBWlev from './getBWlev'

export default function createLevel(BrowseLevel, probe_name, num, parent_bwlev, md, map) {
  const bwlev = getBWlev(BrowseLevel, md, probe_name, parent_bwlev, num, map)
  bwlev.map = map
  return bwlev
}
