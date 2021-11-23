
import LocalWatchRoot from './LocalWatchRoot'
import addFrom from './addFrom'
import checkNesting from './checkNesting'

function initList(self, list) {
  self.states_links = self.states_links || null
  self.nes_match_index = self.nes_match_index || null

  if (!list) {
    return
  }

  for (let i = 0; i < list.length; i++) {
    addFrom(self, new LocalWatchRoot(self, list[i]), 0)
  }
}

export default {
  initList: initList,
  checkNesting: checkNesting,
}
