
import { cacheFields } from '../../../cachedField'
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

const netsources_of_nestings = [['_nest_reqs'], getSource]

const schema = {
  netsources_of_nestings,
}

export default function buildNestReqs(self) {
  cacheFields(schema, self)
}
