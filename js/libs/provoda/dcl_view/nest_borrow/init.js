
import spv from '../../../spv'

import watcherKey from './watcherKey'
import getParent from './getParent'
import checkChange from './check-change'
const nil = spv.nil
const checkChildren = checkChange.checkChildren


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


    upper_view.nest_borrow_watchers = upper_view.nest_borrow_watchers || spv.set.create()

    const item = {
      dcl: cur,
      view: self,
    }

    spv.set.add(upper_view.nest_borrow_watchers, watcherKey(cur.name, self), item)
    checkChildren(upper_view, item)
  }
}
