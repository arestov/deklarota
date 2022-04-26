
import assign from '../utils/assign'
import changeSources from '../utils/changeSources'
import parseCompItems from '../../../attrs/comp/parseItems'

const getSource = (by_name) => {
  const netsources_of_nestings = {
    api_names: [],
    api_names_converted: false,
    sources_names: []
  }

  for (const nest_name in by_name) {
    const cur_nest = by_name[nest_name]
    changeSources(netsources_of_nestings, cur_nest.send_declr)

    if (!cur_nest.state_dep) {
      continue
    }
  }

  return netsources_of_nestings
}

export const ___dcl_eff_consume_req_nest = [
  ['_nest_reqs'],
  (_nest_reqs) => {
    const extended_comp_attrs = {}

    for (const nest_name in _nest_reqs) {
      const cur_nest = _nest_reqs[nest_name]

      if (!cur_nest.state_dep) {
        continue
      }

      assign(extended_comp_attrs, cur_nest)
    }

    parseCompItems(extended_comp_attrs)
    return extended_comp_attrs
  },
]

export const netsources_of_nestings = [['_nest_reqs'], getSource]

