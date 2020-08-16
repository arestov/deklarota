
import collectStateChangeHandlers from '../dcl/collectStateChangeHandlers'

export default function(self, props) {
  var index = collectStateChangeHandlers(self, props)
  if (!index) {return}

  self._has_stchs = true

  self.stch_hs = []
  self.stch_hs_list = []

  for (var stname in index) {
    if (!index[stname]) {continue}

    self.stch_hs.push({
      name: stname,
      item: index[stname]
    })

    self.stch_hs_list.push(stname)
  }
}
