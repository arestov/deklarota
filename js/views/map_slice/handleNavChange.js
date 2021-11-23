import getModelFromR from '../../libs/provoda/provoda/v/getModelFromR'

const handleNavChange = (self, change) => {
  switch (change.type) {
    case 'move-view': {
      self.setVMpshow(self.getStoredMpx(getModelFromR(self, change.bwlev)), change.value)
      return
    }
  }

  throw new Error('unknown navChange type: ' + change.type)

}

export default handleNavChange
