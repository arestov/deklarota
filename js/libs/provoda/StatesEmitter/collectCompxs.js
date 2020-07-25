define(function(require) {
'use strict';

var spv = require('spv');
var cloneObj = spv.cloneObj
var groupDeps = require('../utils/groupDeps')
var getEncodedState= require('../utils/getEncodedState');
var getShortStateName= require('../utils/getShortStateName');

var identical = function(state) {
  return state;
};

var makeGroups = groupDeps(getEncodedState, function(cur) {
  return cur.depends_on;
})

var fromArray = function(state_name, cur) {
  return {
    depends_on: cur[0] || [],
    fn: cur[1],
    name: state_name,
    watch_list: null
  };
};

var toParsedDeps = function(array) {
  var result = new Array(array.length)
  var require_marks = []
  for (var i = 0; i < array.length; i++) {
    var cur = array[i]

    if (cur.charAt(0) != '&') {
      result[i] = cur
      continue
    }

    result[i] = cur.slice(1)
    require_marks.push(i)
  }

  return {fixed_deps: result, require_marks: require_marks}
}

var declr = function(comlx_name, cur) {
  var item = cur instanceof Array ? fromArray(comlx_name, cur) : cur;
  var raw_depends_on = item.depends_on

  if (!Array.isArray(raw_depends_on)) {
    throw new Error('should be list');
  }

  var parsed = toParsedDeps(raw_depends_on)
  item.depends_on = parsed.fixed_deps
  item.require_marks = parsed.require_marks

  item.name = comlx_name;

  if (!item.depends_on.length && typeof item.fn !== 'function') {
    throw new Error('use attr "input" to define default values')
  }

  if (!item.fn) {
    item.fn = identical;
  }
  if (!Array.isArray(item.depends_on)) {
    throw new Error('should be list');
  }

  item.watch_list = new Array(item.depends_on.length || 0);

  for (var i = 0; i < item.depends_on.length; i++) {
    if (!item.depends_on[i]) {
      throw new Error('state name should not be empty');
    }
    item.watch_list[i] = getShortStateName(item.depends_on[i]);
  }
  return item;
};


var collectBuildParts = function(self) {
  var compx_check = {};
  var full_comlxs_list = [];

  for (var key_name_one in self._dcl_cache__compx) {
    compx_check[key_name_one] = self._dcl_cache__compx[key_name_one];
    full_comlxs_list.push(compx_check[key_name_one]);
  }

  self.compx_check = compx_check;
  self.full_comlxs_list = full_comlxs_list;
}

var makeWatchIndex = function(full_comlxs_list) {
  var full_comlxs_index = {};
  var i, jj, cur, state_name;
  for (i = 0; i < full_comlxs_list.length; i++) {
    cur = full_comlxs_list[i];
    for (jj = 0; jj < cur.watch_list.length; jj++) {
      state_name = cur.watch_list[jj];
      if (state_name === cur.name) {continue;}
      if (!full_comlxs_index[state_name]) {
        full_comlxs_index[state_name] = [];
      }
      full_comlxs_index[state_name].push(cur);
    }
  }
  return full_comlxs_index;
}

var extendTyped = function(self, typed_state_dcls) {
  var result = cloneObj(null, self._dcl_cache__compx) || {};

  var extending_part = {};

  for (var name in typed_state_dcls) {
    if (!typed_state_dcls.hasOwnProperty(name)) {
      continue;
    }
    extending_part[name] = declr(name, typed_state_dcls[name]);
  }

  result = cloneObj(result, extending_part);

  self._dcl_cache__compx = result;
};

return function(self, props, typed_part) {
  if (typed_part) {
    extendTyped(self, typed_part);
  }

  var need_recalc = typed_part;
  if (!need_recalc){
    return;
  }

  collectBuildParts(self);
  self.full_comlxs_index = makeWatchIndex(self.full_comlxs_list);

  collectStatesConnectionsProps(self, self.full_comlxs_list);

  return true;
};

function collectStatesConnectionsProps(self, full_comlxs_list) {
  /*

  [['^visible', '@some:complete:list', '#vk_id'], function(visible, complete){

  }]
  */
  /*
      nest_match: [
    ['songs-list', 'mf_cor', 'sorted_completcs']
  ]
  */
  var result = makeGroups(full_comlxs_list);
  var compx_nest_matches = new Array(result.conndst_nesting.length)
  for (var i = 0; i < result.conndst_nesting.length; i++) {
    compx_nest_matches[i] = result.conndst_nesting[i].nwatch;
  }

  self.compx_nest_matches = compx_nest_matches;
  self.connect_self = result.connect_self

  self.conndst_parent = result.conndst_parent
  self.conndst_nesting = result.conndst_nesting
  self.conndst_root = result.conndst_root;
}
});
