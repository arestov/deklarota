
import spv from '../../../spv'
import isBwlevName from '../../utils/isBwlevName'
const nil = spv.nil

export default function getRootBwlevView(target) {
  let cur = target.parent_view
  let possible_root

  while (!nil(cur)) {
    if (isBwlevName(cur.mpx.md.model_name)) {
      possible_root = cur
    }

    cur = cur.parent_view
  }

  return possible_root
}
