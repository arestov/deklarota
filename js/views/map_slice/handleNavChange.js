import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'

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
