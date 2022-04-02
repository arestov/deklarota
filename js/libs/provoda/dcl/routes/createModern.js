
import _updateRel from '../../_internal/_updateRel'
import matchRoute from '../../routes/match'
import get_constr from '../../structure/get_constr'
const getNestingConstr = get_constr.getNestingConstr

export const getRouteConstr = (model, dcl) => {
  return getNestingConstr(model.app, model, dcl.dest)
}

export function selectModern(self, sp_name) {
  if (self.__routes_matchers_defs == null) {
    return
  }

  for (let i = 0; i < self.__routes_matchers_defs.length; i++) {
    const cur = self.__routes_matchers_defs[i]
    const matched = matchRoute(cur.route, sp_name)
    if (!matched) {
      continue
    }

    const Constr = getRouteConstr(self, cur)

    return {matched: matched, routedcl: cur, Constr: Constr}
  }
}

function createModern(self, sp_name, extra_states) {
  const selected = selectModern(self, sp_name)
  if (!selected) {
    return
  }

  const Constr = selected.Constr

  let attrs = null
  if (extra_states || selected.matched) {
    attrs = attrs || {}
    Object.assign(attrs, extra_states, selected.matched)
  }


  const created = self.initSi(Constr, {
    by: 'routePathByModels',
    init_version: 2,
    attrs: attrs,
  })

  const nesting_name = selected.routedcl.dest
  const cur_list = self.getNesting(selected.routedcl.dest)
  const new_list = cur_list ? cur_list.slice(0) : []
  new_list.push(created)
  _updateRel(self, nesting_name, new_list)

  return created
}

createModern.selectModern = selectModern

export default createModern
