
import watcherKey from './watcherKey'
import getParent from './getParent'
import spv from '../../../spv'
const nil = spv.nil

export default function(self) {
  if (nil(self._nest_borrow)) {
    return
  }

  for (const key in self._nest_borrow) {
    const cur = self._nest_borrow[key]
    const upper_view = getParent(self, cur.parent_count)

    if (nil(upper_view)) {
      throw new Error('cant find upper_view')
    }

    spv.set.remove(upper_view.nest_borrow_watchers, watcherKey(cur, self))
  }
}
