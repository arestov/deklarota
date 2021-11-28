import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'
import getLevByBwlev from './getLevelContainer'
import dom_helpers from '../../libs/provoda/utils/dom_helpers'

const ensureCorrectBwlevContainer = (level_con, view) => {
  /*
    this code could be unnecessary
    due reappending code in View/appending.js
  */
  const view_con = view.getCNode()
  const lev_con_node = dom_helpers.unwrap(level_con.material)

  if (view_con.parentNode !== lev_con_node) {
    lev_con_node.appendChild(view_con)
  }
}

const handleNavChange = (self, change) => {
  const mpx = self.getStoredMpx(getModelFromR(self, change.bwlev))
  switch (change.type) {
    case 'move-view': {
      self.setVMpshow(mpx, change.value)
      return
    }
    case 'travebasing-remove': {
      self.setVMpshow(mpx, false)
      return
    }
    case 'travebasing-update': {
      self.setVMpshow(mpx, true)
      const views = self.getChildViewsByMpx(mpx)
      const level_con = getLevByBwlev(self, change.bwlev)
      for (let i = 0; i < views.length; i++) {
        ensureCorrectBwlevContainer(level_con, views[i])
      }

      return
    }
    case 'travebasing-add': {
      self.setVMpshow(mpx, true)
      return
    }
  }

  throw new Error('unknown navChange type: ' + change.type)

}

export default handleNavChange
