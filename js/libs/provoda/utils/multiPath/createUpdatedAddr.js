import { getStateInfo, getNestInfo, getBaseInfo, updateResultType } from './parse'
import { doCopy } from '../../../spv/cloneObj'

var updatePart = function(addr, part, string) {
  switch (part) {
    case 'state': {
      addr.as_string = null
      addr.state = getStateInfo(string)
      return
    }
    case 'zip_name': {
      addr.as_string = null
      addr.zip_name = string
      return
    }
    case 'nesting': {
      addr.as_string = null
      addr.nesting = getNestInfo(string)
      return
    }
    case 'from_base': {
      addr.as_string = null
      addr.from_base = getBaseInfo(string)
      return
    }
    default: {
      throw new Error('not implemented')
    }
  }
}

var createUpdatedAddr = function createUpdatedAddr(addr, part, string) {
  const result = doCopy({}, addr)
  updatePart(result, part, string)
  updateResultType(result)
  return result

}

export default createUpdatedAddr
