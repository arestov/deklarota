define(function(require) {
'use strict';
var spv = require('spv');

function makePath(parent_path, current_name) {
  var used_name = [current_name || 'unknown']
  if (!parent_path) {
    return used_name
  }

  return parent_path.concat(used_name)
}

function mark(Constr, RootConstr, parent_path) {
  var self = Constr.prototype;

  self._all_chi = {};

  var all = {};

  spv.cloneObj(all, self._chi);
  spv.cloneObj(all, self._chi_sub_pager);
  spv.cloneObj(all, self._chi_sub_pages);
  spv.cloneObj(all, self._chi_sub_pages_side);
  spv.cloneObj(all, self._chi_nest);
  spv.cloneObj(all, self._chi_nest_rqc);

  for (var prop in all) {
    var cur = all[prop]
    if (!cur) {
      self._all_chi[prop] = null
      continue
    }

    var hierarchy_path = makePath(parent_path, cur.prototype.hierarchy_name)

    var item = spv.inh(all[prop], {
      skip_code_path: true
    }, {
      pconstr_id: self.constr_id,
      _parent_constr: Constr,
      _root_constr: RootConstr,
      hierarchy_path: hierarchy_path,
      hierarchy_path_string: hierarchy_path.join('  ')
    });

    self._all_chi[prop] = mark(item, RootConstr, hierarchy_path);
  }

  if (Constr == RootConstr) {
    if (self.zero_map_level) {
      self.start_page = self
    } else {
      var start_page = self._all_chi['chi-start__page']
      self.start_page = (start_page && start_page.prototype) || self
    }
  }

  return Constr;
}

return mark;
});
