
import getStart from '../utils/multiPath/getStart'

export default function getStartModel(target, nwatch) {
  if (!nwatch) {
    return target
  }

  var start_md = getStart(target, nwatch.nmpath_source, true)
  return start_md
}
