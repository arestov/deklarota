
var NestWatch = require('../../nest-watch/NestWatch')
var parseRoute = require('../../routes/parse')
var stringifyRoute = require('../../routes/stringify')
var asMultiPath = require('../../utils/NestingSourceDr/asMultiPath')
var pvState = require('../../utils/state')
var run = require('./run')

var getMatched = function(runner) {
  if (!runner.matched) {
    runner.matched = []
  }

  return runner.matched
}

var areStatesValid = function(md, states) {
  for (var jj = 0; jj < states.length; jj++) {
    var cur = states[jj]
    var value = pvState(md, cur)
    if (value == null) {
      return false
    }
  }

  return true
}

var handleChangedCount = function handleChangedCount(motivator, n2, lnwatch, n3, ordered_items) {

  var runner = lnwatch.data.route_runner

  var result = getMatched(runner)
  runner.matched = null

  // reusing
  result.length = 0
  if (!ordered_items) {
    return
  }


  for (var i = 0; i < ordered_items.length; i++) {
    var cur = ordered_items[i]
    if (!areStatesValid(cur, runner.dcl.states)) {
      continue
    }

    var key = stringifyRoute(runner.dcl.route, cur.states)
    result.push(key, cur)
  }

  runner.matched = result

  run(runner)

}

var handleChangedState = function(motivator, n1, lnwatch, changes) {
  // PLACE TO IMPROVE PERFORMANCE
  // we dont need full run & index rebuilding
  // TODO:
  // implement atomic changes of index here

  handleChangedCount(motivator, null, lnwatch, null, lnwatch.ordered_items)

}

var Route = function(name, data) {
  this.source = Array.isArray(data) ? data[0] : data
  this.dest = Array.isArray(data) ? data[1] : data
  this.path = name
  var route = parseRoute(name)

  var states = []
  for (var i = 0; i < route.parts.length; i++) {
    var cur = route.parts[i]
    if (!cur.state) {
      continue
    }
    states.push(cur.state[0])
  }

  this.route = route

  var multi_path = asMultiPath(this.source)
  this.states = states

  this.nwbase = new NestWatch(multi_path, states, {
    onchd_count: handleChangedCount,
    onchd_state: handleChangedState
  }/*, handleAdding, handleRemoving*/)
}

export default Route
