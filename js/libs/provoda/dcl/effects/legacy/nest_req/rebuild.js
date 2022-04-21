
import changeSources from '../utils/changeSources'

export default function buildNestReqs(self, by_name) {
  self._nest_reqs = by_name

  self.netsources_of_nestings = {
    api_names: [],
    api_names_converted: false,
    sources_names: []
  }

  for (const nest_name in self._nest_reqs) {
    const cur_nest = self._nest_reqs[nest_name]
    changeSources(self.netsources_of_nestings, cur_nest.send_declr)

    if (!cur_nest.state_dep) {
      continue
    }
  }
}
