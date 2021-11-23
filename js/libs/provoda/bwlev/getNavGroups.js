
import isBigStep from './isBigStep'

export default function getNavGroups(bwlev) {
  let cur_group = []
  const groups = [cur_group]

  let cur = bwlev
  let cur_child = cur.getNesting('pioneer')
  while (cur) {
    cur_group.push(cur_child)

    if (isBigStep(cur, cur_child)) {
      cur_group = []
      groups.push(cur_group)
    }

    cur = cur.map_parent // it's ok to do `bwlev.map_parent`
    cur_child = cur && cur.getNesting('pioneer')
  }
  return groups
}
