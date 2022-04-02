
import spv from '../../spv'
import collectStateChangeHandlers from './collectStateChangeHandlers'
const splitByDot = spv.splitByDot


const getParsedStateChange = spv.memorize(function getParsedStateChange(string) {
  if (string.indexOf('@') == -1) {
    return false
  }
  const parts = string.split('@')
  return {
    state: parts[0],
    selector: splitByDot(parts[1])
  }
})

export default function(self, props) {
  const index = collectStateChangeHandlers(self, props)
  if (!index) {return}

  self._has_stchs = true

  self.st_nest_matches = []

  for (const stname in index) {
    if (!index[stname]) {continue}

    const nw_draft2 = getParsedStateChange(stname)
    if (!nw_draft2) { continue }
    const err = new Error('wrap `stch` in comp attr')
    console.log({ attr: stname }, err)

    throw err
  }
}
