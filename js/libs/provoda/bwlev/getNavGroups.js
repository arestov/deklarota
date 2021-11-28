
import isBigStep from './isBigStep'
import getBwlevParent from './getBwlevParent'

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

    cur = getBwlevParent(cur)
    cur_child = cur && cur.getNesting('pioneer')
  }
  return groups
}
