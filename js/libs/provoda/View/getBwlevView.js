
import spv from '../../spv'
import isBwlevName from '../utils/isBwlevName'
const nil = spv.nil

function getBwlevView(target) {
  let cur = target

  while (!nil(cur)) {
    if (isBwlevName(cur.mpx.md.model_name)) {
      return cur
    }

    cur = cur.parent_view
  }

}
export default getBwlevView
