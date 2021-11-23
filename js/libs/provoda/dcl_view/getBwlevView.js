
import spv from '../../spv'
const nil = spv.nil

export default function getBwlevView(target) {
  let cur = target

  while (!nil(cur)) {
    if (cur.mpx.md.model_name == 'bwlev') {
      return cur
    }

    cur = cur.parent_view
  }

}
