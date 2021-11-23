
import structureChild from '../../structure/child'

const build = function(self, result) {
  self.nestings_declarations = []
  self.idx_nestings_declarations = result
  self._chi_nest = {}

  for (const name in result) {
    if (!result.hasOwnProperty(name)) {
      continue
    }
    var cur = result[name]
    if (!cur) {
      continue
    }
    self.nestings_declarations.push(cur)
    const item = cur.subpages_names_list
    if (Array.isArray(item)) {
      for (let kk = 0; kk < item.length; kk++) {
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

export default build
