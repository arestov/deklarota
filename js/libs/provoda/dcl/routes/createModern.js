define(function(require) {
'use strict'
var _updateRel = require('_updateRel');
var matchRoute = require('../../routes/match')
var get_constr = require('../../structure/get_constr');
var getNestingConstr = get_constr.getNestingConstr
var allStates = require('./allStates')

var createStates = function (Constr, sp_name, extra_states) {
  var has_compx = Constr.prototype.hasComplexStateFn('url_part')
  if (has_compx) {
    return allStates(null, extra_states)
  }

  return allStates({
    url_part: '/' + sp_name
  }, extra_states)
}

function selectModern(self, sp_name) {
  if (self.__routes_matchers_defs == null) {
    return
  }

  for (var i = 0; i < self.__routes_matchers_defs.length; i++) {
    var cur = self.__routes_matchers_defs[i];
    var matched = matchRoute(cur.route, sp_name)
    if (!matched) {
      continue;
    }

    var Constr = getNestingConstr(self.app, self, cur.dest)

    return {matched: matched, routedcl: cur, Constr: Constr}
  }
}

function createModern(self, sp_name, extra_states) {
  var selected = selectModern(self, sp_name)
  if (!selected) {
    return
  }

  var Constr = selected.Constr

  var created = self.initSi(Constr, {
    by: 'routePathByModels',
    init_version: 2,
    states: createStates(Constr, sp_name, extra_states),
    head: selected.matched,
  });

  var nesting_name = selected.routedcl.dest
  var cur_list = self.getNesting(selected.routedcl.dest)
  var new_list = cur_list ? cur_list.slice(0) : []
  new_list.push(created)
  _updateRel(self, nesting_name, new_list)

  return created
}

createModern.selectModern = selectModern

return createModern
})
