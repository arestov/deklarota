
import spv from '../../spv'
const nil = spv.nil

function getBwlevView(target) {
  let cur = target

  while (!nil(cur)) {
    if (cur.mpx.md.model_name == 'bwlev') {
      return cur
    }

    cur = cur.parent_view
  }

}
export default getBwlevView
