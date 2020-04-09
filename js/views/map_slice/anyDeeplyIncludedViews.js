define(function() {
'use strict';
var getModelFromR = require('pv/v/getModelFromR')
var getNesting = require('pv/getNesting')

var matchParent = function(possible_parent, child) {
  var cur = child;
  while (cur.parent_view) {
    if (cur.parent_view == possible_parent) {
      return true
    }

    cur = cur.parent_view
  }

  return false;
}

return function(spyglass_view, current_bwlev_mdr, target_bwlev_mdr) {
  // look if any views of md if deeply included in target_root
  // to do this we will check if one of parent_view.parent_view[...] of mpx views is target_root
  var current_bwlev = current_bwlev_mdr && getModelFromR(spyglass_view, current_bwlev_mdr)
  if (!current_bwlev) {
    return null
  }

  var cur_md = getNesting(current_bwlev, 'pioneer');
  var bwlev_view = spyglass_view.getMapSliceView(current_bwlev, cur_md);

  var target_bwlev = getModelFromR(spyglass_view, target_bwlev_mdr)
  var target_md = getNesting(target_bwlev, 'pioneer');

  var views = spyglass_view.getStoredMpx(target_md).getViews();
  if (!views) {
    return null;
  }
  for (var i = 0; i < views.length; i++) {
    var cur = views[i]
    if (matchParent(bwlev_view, cur)) {
      return cur;
    }

  }
}
})
