
import _updateRel from '../../_internal/_updateRel'
import matchRoute from '../../routes/match'
import get_constr from '../../structure/get_constr'
import allStates from './allStates'
const getNestingConstr = get_constr.getNestingConstr

const createStates = function(Constr, sp_name, extra_states) {
  const has_compx = Constr.prototype.hasComplexStateFn('url_part')
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

  for (let i = 0; i < self.__routes_matchers_defs.length; i++) {
    const cur = self.__routes_matchers_defs[i]
    const matched = matchRoute(cur.route, sp_name)
    if (!matched) {
      continue
    }

    const Constr = getNestingConstr(self.app, self, cur.dest)

    return {matched: matched, routedcl: cur, Constr: Constr}
  }
}

function createModern(self, sp_name, extra_states) {
  const selected = selectModern(self, sp_name)
  if (!selected) {
    return
  }

  const Constr = selected.Constr

  const created = self.initSi(Constr, {
    by: 'routePathByModels',
    init_version: 2,
    attrs: createStates(Constr, sp_name, extra_states),
    head: selected.matched,
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
