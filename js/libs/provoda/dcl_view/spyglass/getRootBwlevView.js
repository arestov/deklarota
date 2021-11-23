
import spv from '../../../spv'
const nil = spv.nil

export default function getRootBwlevView(target) {
  let cur = target.parent_view
  let possible_root

  while (!nil(cur)) {
    if (cur.mpx.md.model_name == 'bwlev') {
      possible_root = cur
    }

    cur = cur.parent_view
  }

  return possible_root
}
