
import spv from 'spv'

import watcherKey from './watcherKey'
import getParent from './getParent'
import checkChange from './check-change'
var nil = spv.nil
var checkChildren = checkChange.checkChildren


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


    upper_view.nest_borrow_watchers = upper_view.nest_borrow_watchers || spv.set.create()

    var item = {
      dcl: cur,
      view: self,
    }

    spv.set.add(upper_view.nest_borrow_watchers, watcherKey(cur.name, self), item)
    checkChildren(upper_view, item)
  }
}
