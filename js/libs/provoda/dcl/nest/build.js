define(function(require) {
'use strict'
var structureChild = require('../../structure/child')

var build = function(self, result) {
  self.nestings_declarations = []
  self.idx_nestings_declarations = result
  self._chi_nest = {}

  for (var name in result) {
    if (!result.hasOwnProperty(name)) {
      continue
    }
    var cur = result[name]
    if (!cur) {
      continue
    }
    self.nestings_declarations.push(cur)
    var item = cur.subpages_names_list
    if (Array.isArray(item)) {
      for (var kk = 0; kk < item.length; kk++) {
        var cur = item[kk]
        if (cur.type == 'constr') {
          self._chi_nest[item[kk].key] = structureChild(cur.name, cur.value, ['nest', 'nest'])
        }
      }
    } else {
      if (item.type == 'constr') {
        self._chi_nest[item.key] = structureChild(item.name, item.value, ['nest', 'nest'])
      }
    }
  }
}

return build
})
