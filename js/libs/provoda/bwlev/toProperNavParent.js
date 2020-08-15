define(function() {
'use strict'

return function properParent(md) {
  var cur = md
  while (cur && cur._x_skip_navigation) {
    cur = cur.map_parent
  }

  return cur

}

})
