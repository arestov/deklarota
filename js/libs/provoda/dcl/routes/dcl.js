import parseRoute from '../../routes/parse'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import asMultiPath from '../../utils/NestingSourceDr/asMultiPath'

const Route = function(name, data) {
  this.source = Array.isArray(data) ? data[0] : data
  this.dest = Array.isArray(data) ? data[1] : data
  this.path = name
  this.path_template = name
  const route = parseRoute(name)
  this.route = route

  const multi_path = asMultiPath(this.source)
  this.addr = multi_path

  const states = []
  const all_addrs = []

  for (let i = 0; i < route.parts.length; i++) {
    const cur = route.parts[i]
    if (!cur.state) {
      continue
    }
    states.push(cur.state[0])
    all_addrs.push(createUpdatedAddr(multi_path, { state: cur.state[0] }))
  }

  this.states = states
  this.all_addrs = all_addrs
}

export default Route
