
import ba_canReuse from './ba_canReuse'
import showInterest from './showInterest'
import _goDeeper from './_goDeeper'
import getBwlevFromParentBwlev from './getBwlevFromParentBwlev'
import showMOnMap from './showMOnMap'
import isBigStep from './isBigStep'
import getNavGroups from './getNavGroups'
import toProperNavParent from './toProperNavParent'
import getRouteStepParent from './getRouteStepParent'
import getBwlevParent from './getBwlevParent'

// var limits = {
//   same_model_matches: 1,
//   big_steps: 4
// }

export default function followFromTo(BWL, map, parent_bwlev, end_md) {
  const cutted_parents = getLimitedParent(map, parent_bwlev, end_md)

  if (cutted_parents) {
    const last_cutted_parentbw = showInterest(map, cutted_parents)
    return _goDeeper(BWL, map, end_md, last_cutted_parentbw, true)
  }
  // parent_bwlev.showOnMap();

  const bwlev = getBwlevFromParentBwlev(parent_bwlev, end_md)

  if (ba_canReuse(bwlev)) {
    return showMOnMap(BWL, map, end_md, bwlev)
  }
  // !!!!showMOnMap(BWL, map, parent_bwlev.getNesting('pioneer'), parent_bwlev);
  return _goDeeper(BWL, map, end_md, parent_bwlev, true)
}




function getLimitedParent(map, parent_bwlev, end_md) {
  const pioneer = parent_bwlev.getNesting('pioneer')
  // var pre_mn = pioneer.model_name == end_md.model_name;
  const pre_group = pioneer != toProperNavParent(map, getRouteStepParent(map, end_md))


  // var cur = parent_bwlev;
  // var cur_child = end_md;
  // var counter = 0;

  // var big_steps = 0;
  // var same_model_matches = 0;

  // var last_ok;

  // var cut = false;


  const groups_count = countGroups(parent_bwlev)
  const all_groups_count = groups_count + (pre_group ? 1 : 0)


  const similar_model_edge = getEdgeSimilarModelPos(parent_bwlev, end_md.model_name, 3)

  if (all_groups_count > 3 || similar_model_edge != -1) {

    const count_slice = 3 + (pre_group ? -1 : 0)
    const sm_slice = similar_model_edge == -1 ? Infinity : similar_model_edge + 1
    const slice = Math.min(count_slice, sm_slice)
    const groups = getNavGroups(parent_bwlev)
    const sliced = groups.slice(0, slice)

    return sliced.map(interestPart).reverse()
  }

  return false
}


function getEdgeSimilarModelPos(bwlev, model_name, limit) {
  let edge_group_num = -1
  let groups_of_similar = 0
  let groups_count = 0
  let cur = bwlev
  let cur_child = cur.getNesting('pioneer')
  while (cur) {
    if (cur_child.model_name == model_name) {
      if (edge_group_num != groups_count) {
        edge_group_num = groups_count
        groups_of_similar++
        if (groups_of_similar == limit) {
          break
        }
      }
    }

    if (isBigStep(cur, cur_child)) {
      groups_count++
    }

    cur = getBwlevParent(cur)
    cur_child = cur && cur.getNesting('pioneer')
  }
  return groups_of_similar == limit ? edge_group_num : -1
}

function countGroups(bwlev) {
  let groups_count = 1
  let cur = bwlev
  let cur_child = cur.getNesting('pioneer')
  while (cur) {

    if (isBigStep(cur, cur_child)) {
      groups_count++
    }

    cur = getBwlevParent(cur)
    cur_child = cur && cur.getNesting('pioneer')
  }
  return groups_count
}


function interestPart(group) {
  return {
    md: group[0],
    distance: group.length
  }
}
