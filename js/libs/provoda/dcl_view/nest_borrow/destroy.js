
import watcherKey from './watcherKey'
import getParent from './getParent'
import spv from '../../../spv'
var nil = spv.nil

export default function(self) {
  if (nil(self._nest_borrow)) {
    return
  }

  for (var key in self._nest_borrow) {
    var cur = self._nest_borrow[key]
    var upper_view = getParent(self, cur.parent_count)

    if (nil(upper_view)) {
      throw new Error('cant find upper_view')
    }

    spv.set.remove(upper_view.nest_borrow_watchers, watcherKey(cur, self))
  }
}
