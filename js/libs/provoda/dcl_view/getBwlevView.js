
import spv from '../../spv'
var nil = spv.nil

export default function getBwlevView(target) {
  var cur = target

  while (!nil(cur)) {
    if (cur.mpx.md.model_name == 'bwlev') {
      return cur
    }

    cur = cur.parent_view
  }

}
