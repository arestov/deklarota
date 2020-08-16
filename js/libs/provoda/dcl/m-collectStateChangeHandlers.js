
import spv from 'spv'
import NestWatch from '../nest-watch/NestWatch'
import toMultiPath from '../utils/NestingSourceDr/toMultiPath'
import collectStateChangeHandlers from './collectStateChangeHandlers'
import standart from '../nest-watch/standartNWH'
var splitByDot = spv.splitByDot

var wrapper = standart(function wrapper(md, items, lnwatch) {
  var callback = lnwatch.nwatch.handler.stch_fn
  callback(md, null, null, {
    items: items,
    item: null
  })
})

var stateHandler = standart(function baseStateHandler(md, items, lnwatch, args) {
  if (!args.length) {return}
  var callback = lnwatch.nwatch.handler.stch_fn
  callback(md, args[1], args[2], {
    items: items,
    item: args[3]
  })
})


var getParsedStateChange = spv.memorize(function getParsedStateChange(string) {
  if (string.indexOf('@') == -1) {
    return false
  }
  var parts = string.split('@')
  return {
    state: parts[0],
    selector: splitByDot(parts[1])
  }
})

export default function(self, props) {
  var index = collectStateChangeHandlers(self, props)
  if (!index) {return}

  self._has_stchs = true

  self.st_nest_matches = []

  for (var stname in index) {
    if (!index[stname]) {continue}

    var nw_draft2 = getParsedStateChange(stname)
    if (!nw_draft2) { continue }

    var callback = index[stname]

    self.st_nest_matches.push(
      new NestWatch(toMultiPath({selector: nw_draft2.selector}), nw_draft2.state, {
        onchd_state: stateHandler,
        onchd_count: wrapper,
        stch_fn: callback,
      })
    )
  }
}
