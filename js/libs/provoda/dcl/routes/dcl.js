
import NestWatch from '../../nest-watch/NestWatch'
import parseRoute from '../../routes/parse'
import stringifyRoute from '../../routes/stringify'
import asMultiPath from '../../utils/NestingSourceDr/asMultiPath'
import pvState from '../../utils/state'

const getMatched = function(runner) {
  if (!runner.matched) {
    runner.matched = []
  }

  return runner.matched
}

const areStatesValid = function(md, states) {
  for (let jj = 0; jj < states.length; jj++) {
    const cur = states[jj]
    const value = pvState(md, cur)
    if (value == null) {
      return false
    }
  }

  return true
}

const makeMatchingData = (mut_result, dcl, self, ordered_items) => {
  mut_result.length = 0
  if (!ordered_items) {
    return
  }


  for (let i = 0; i < ordered_items.length; i++) {
    const cur = ordered_items[i]
    if (!areStatesValid(cur, dcl.states)) {
      continue
    }

    const key = stringifyRoute(dcl.route, cur.states)
    mut_result.push(key, cur)
  }


  self.__modern_subpages_valid = false
  self.__modern_subpages = null
}

const handleChangedCount = function handleChangedCount(_motivator, _n2, lnwatch, _n3, ordered_items) {

  const runner = lnwatch.data.route_runner
  const self = runner.md
  const { dcl } = runner

  const result = getMatched(runner)
  runner.matched = null
  // reusing
  makeMatchingData(result, dcl, self, ordered_items)

  runner.matched = result

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
