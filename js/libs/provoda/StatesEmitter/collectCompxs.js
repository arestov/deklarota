define(function(require) {
'use strict';

var spv = require('spv');
var cloneObj = spv.cloneObj
var groupDeps = require('../utils/groupDeps')
var getEncodedState= require('../utils/getEncodedState');
var getShortStateName= require('../utils/getShortStateName');

var getParsedState = require('../utils/getParsedState')

var asString = require('../utils/multiPath/asString')
var fromLegacy = require('../utils/multiPath/fromLegacy')
var parse = require('../utils/multiPath/parse')
var mentionsSupportedAddr = require('../Model/mentions/supportedAttrTargetAddr')

var isJustAttrAddr = function(addr) {
  if (addr.result_type !== 'state') {
    return false
  }

  if (addr.nesting.path || (addr.resource && addr.resource.path) || addr.from_base.type) {
    return false
  }

  return true
}

var shortStringWhenPossible = function(addr) {

  if (!isJustAttrAddr(addr)) {
    return asString(addr)
  }

  return addr.state.path
}

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

var toAddr = function(state_name) {
  var result1 = getParsedState(state_name)
  if (result1) {
    var nice = fromLegacy(state_name)
    var best = asString(nice)
    console.warn('replace ' + state_name + ' by ' + best)

    return nice
  }

  var addr = parse(state_name)
  if (addr) {
    return addr
  }

  // it could be $meta or __, or anything else
  var last_result = parse.simpleState(state_name)
  return last_result
}

var toParsedDeps = function(array) {
  var result = new Array(array.length)
  var require_marks = []
  for (var i = 0; i < array.length; i++) {
    var cur = array[i]

    if (cur.charAt(0) != '&') {
      result[i] = toAddr(cur)
      continue
    }

    result[i] = toAddr(cur.slice(1))
    require_marks.push(i)
  }

  return {fixed_deps: result, require_marks: require_marks}
}

var CompxAttrDecl = function(comlx_name, cur) {
  var item = cur instanceof Array ? fromArray(comlx_name, cur) : cur;
  var raw_depends_on = item.depends_on

  if (!Array.isArray(raw_depends_on)) {
    throw new Error('should be list');
  }

  var parsed = toParsedDeps(raw_depends_on)

  this.addrs = parsed.fixed_deps
  this.depends_on = parsed.fixed_deps.map(shortStringWhenPossible)
  this.require_marks = parsed.require_marks

  this.name = comlx_name;

  if (!this.depends_on.length && typeof item.fn !== 'function') {
    throw new Error('use attr "input" to define default values')
  }

  this.fn = item.fn || identical

  if (!Array.isArray(this.depends_on)) {
    throw new Error('should be list: ' + this.depends_on);
  }

  this.watch_list = new Array(this.depends_on.length || 0);

  for (var i = 0; i < this.depends_on.length; i++) {
    if (!this.depends_on[i]) {
      throw new Error('state name should not be empty');
    }
    this.watch_list[i] = getShortStateName(this.depends_on[i]);
  }
  return this;
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
    extending_part[name] = new CompxAttrDecl(name, typed_state_dcls[name]);
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

function uniqExternalDeps(full_comlxs_list) {
  var uniq = spv.set.create()

  for (var i = 0; i < full_comlxs_list.length; i++) {
    var cur = full_comlxs_list[i]
    for (var jj = 0; jj < cur.addrs.length; jj++) {
      var addr = cur.addrs[jj]
      if (isJustAttrAddr(addr)) {
        continue
      }

      spv.set.add(uniq, asString(addr), addr)
    }
  }

  return uniq.list
}

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
  self.__attrs_full_comlxs_list = full_comlxs_list
  self.__attrs_uniq_external_deps = uniqExternalDeps(full_comlxs_list)

  var result = makeGroups(full_comlxs_list);
  var compx_nest_matches = []
  for (var i = 0; i < result.conndst_nesting.length; i++) {
    var nwatch = result.conndst_nesting[i].nwatch
    var addr = nwatch.nmpath_source
    if (mentionsSupportedAddr(addr)) {
      continue
    }
    compx_nest_matches.push(nwatch)
  }

  self.compx_nest_matches = compx_nest_matches;
  self.connect_self = result.connect_self

  self.conndst_parent = result.conndst_parent
  self.conndst_nesting = result.conndst_nesting
  self.conndst_root = result.conndst_root;
}
});
