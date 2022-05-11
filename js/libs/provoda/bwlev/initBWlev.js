
import create from '../create'
import getRel from '../provoda/getRel'

export default function initBWlev(BrowseLevel, md, probe_name, map_level_num, map, parent_bwlev, freeze_parent_bwlev, more_attrs) {
  const bwlev = create(BrowseLevel, {
    probe_name: probe_name,
    map_level_num: map_level_num,
    // model_name: md.model_name,
    is_main_perspectivator_resident: map ? getRel(map, 'mainLevelResident') === md : false,
    pioneer_provoda_id: md._provoda_id,
    pioneer: md,
    freeze_parent_bwlev,
    ...more_attrs,
  }, {
    rels: Object.fromEntries([
      ['pioneer', md],
      map && ['map', map],
      parent_bwlev && ['parent_bwlev', parent_bwlev],
    ].filter(Boolean))
  }, null, md.app)

  return bwlev
}
