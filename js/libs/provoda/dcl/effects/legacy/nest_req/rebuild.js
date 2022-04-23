
import changeSources from '../utils/changeSources'

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

export default function buildNestReqs(self, by_name) {
  self._nest_reqs = by_name

  self.netsources_of_nestings = getSource(by_name)
}
