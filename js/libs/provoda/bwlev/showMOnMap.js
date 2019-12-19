define(function (require) {
'use strict';

var getBwlevFromParentBwlev = require('./getBwlevFromParentBwlev');
var ba_canReuse = require('./ba_canReuse');
var _goDeeper = require('./_goDeeper');
var createLevel = require('./createLevel')
var toProperNavParent = require('./toProperNavParent')

var ba_inUse = ba_canReuse.ba_inUse;

function isStart(md) {
  var cur = md;
  while (cur) {
    if (cur.map_level_num == -1) {
      return true;
    }

    if (cur.map_parent && cur.map_parent._x_skip_navigation) {
      cur = cur.map_parent;
      continue
    }

    return false
  }
}

function ensureStartBwlev(map, md) {

  if (map.mainLevelResident === md) {
    return map.start_bwlev
  }

  if (!map.mainLevelResidents) {
    map.mainLevelResidents = {}
  }

  if (!map.mainLevelResidents[md._provoda_id]) {
    map.mainLevelResidents[md._provoda_id] = createLevel(
      map.BWL,
      map.spyglass_name,
      -1,
      false,
      md,
      map
    );
  }

  return map.mainLevelResidents[md._provoda_id]

}

return function showMOnMap(BWL, map, model, bwlev) {

  var is_start = isStart(model);

  if (is_start) {
    bwlev = ensureStartBwlev(map, model);
  }

  var bwlev_parent = false;

  if (!is_start && (!bwlev || !ba_inUse(bwlev))){
    // если модель не прикреплена к карте,
    // то прежде чем что-то делать - находим и отображаем "родительску" модель
    var parent_md;
    if (bwlev) {
      parent_md = bwlev.map_parent.getNesting('pioneer');
    } else {
      parent_md = model.map_parent;
    }

    parent_md = toProperNavParent(parent_md)

    bwlev_parent = showMOnMap(BWL, map, parent_md, bwlev && bwlev.map_parent, true);
  }

  var result = null;

  if (bwlev_parent || bwlev_parent === false) {

    if (bwlev_parent) {
      if (!bwlev) {
        bwlev = getBwlevFromParentBwlev(bwlev_parent, model);
      }
    }

    if (ba_canReuse(bwlev) || is_start){//если модель прикреплена к карте
      result = bwlev;
    } else {
      if (!model.model_name){
        throw new Error('model must have model_name prop');
      }
      // this.bindMMapStateChanges(model, model.model_name);
      result = _goDeeper(BWL, map, model, bwlev && bwlev.map_parent);
    }
  }

  return result;
  //
};
});
