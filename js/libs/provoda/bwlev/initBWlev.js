
import create from '../create'

export default function initBWlev(BrowseLevel, md, probe_name, map_level_num, map, parent_bwlev) {
  var bwlev = create(BrowseLevel, {
    probe_name: probe_name,
    map_level_num: map_level_num,
    // model_name: md.model_name,
    is_main_perspectivator_resident: map ? map.mainLevelResident === md : false,
    pioneer_provoda_id: md._provoda_id,
    pioneer: md
  }, {
    rels: Object.fromEntries([
      ['pioneer', md],
      map && ['map', map]
    ].filter(Boolean))
  }, parent_bwlev, md.app)

  return bwlev
}
