import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'

const handleNavChange = (self, change) => {
  switch (change.type) {
    case 'move-view': {
      self.setVMpshow(self.getStoredMpx(getModelFromR(self, change.bwlev)), change.value)
      return
    }
    case 'travebasing-remove': {
      self.setVMpshow(self.getStoredMpx(getModelFromR(self, change.bwlev)), false)
      return
    }
    case 'travebasing-update': {
      self.setVMpshow(self.getStoredMpx(getModelFromR(self, change.bwlev)), true)
      return
    }
    case 'travebasing-add': {
      self.setVMpshow(self.getStoredMpx(getModelFromR(self, change.bwlev)), true)
      return
    }
  }

  throw new Error('unknown navChange type: ' + change.type)

}

export default handleNavChange
