
import NestWatch from '../../nest-watch/NestWatch'
import parseRoute from '../../routes/parse'
import asMultiPath from '../../utils/NestingSourceDr/asMultiPath'
import makeMatchingData from './makeMatchingData'

const handleChangedCount = function handleChangedCount(_motivator, _n2, lnwatch, _n3, ordered_items) {

  const runner = lnwatch.data.route_runner
  const self = runner.md
  const { dcl } = runner

  const result = self.__routes_matchers_state.get(dcl.path_template) || []
  // reusing
  makeMatchingData(result, dcl, self, ordered_items)

  self.__routes_matchers_state.set(dcl.path_template, result)

}

const handleChangedState = function(motivator, _n1, lnwatch, _changes) {
  // PLACE TO IMPROVE PERFORMANCE
  // we dont need full run & index rebuilding
  // TODO:
  // implement atomic changes of index here

  handleChangedCount(motivator, null, lnwatch, null, lnwatch.ordered_items)

}

const Route = function(name, data) {
  this.source = Array.isArray(data) ? data[0] : data
  this.dest = Array.isArray(data) ? data[1] : data
  this.path = name
  this.path_template = name
  const route = parseRoute(name)

  const states = []
  for (let i = 0; i < route.parts.length; i++) {
    const cur = route.parts[i]
    if (!cur.state) {
      continue
    }
    states.push(cur.state[0])
  }

  this.route = route

  const multi_path = asMultiPath(this.source)
  this.states = states

  this.nwbase = new NestWatch(multi_path, states, {
    onchd_count: handleChangedCount,
    onchd_state: handleChangedState
  }/*, handleAdding, handleRemoving*/)
}

export default Route
