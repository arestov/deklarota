
import changeSources from '../utils/changeSources'
import assign from '../utils/assign'

export default function buildNestReqs(self, by_name, extended_comp_attrs) {
  self._nest_reqs = by_name

  self.netsources_of_nestings = {
    api_names: [],
    api_names_converted: false,
    sources_names: []
  }

  for (var nest_name in self._nest_reqs) {
    var cur_nest = self._nest_reqs[nest_name]
    changeSources(self.netsources_of_nestings, cur_nest.send_declr)

    if (!cur_nest.state_dep) {
      continue
    }

    assign(extended_comp_attrs, cur_nest)
  }
}
