
import getStart from './getStart'
import multiPathAsString from './asString'

export default function subscribing(fn) {
  return function(md, multi_path, context) {
    if (multi_path.result_type != 'state') {
      throw new Error('think about way to implement this')
    }

    var start_md = getStart(md, multi_path)

    fn(md, start_md, multi_path.state.path, multiPathAsString(multi_path), context)
  }
}
