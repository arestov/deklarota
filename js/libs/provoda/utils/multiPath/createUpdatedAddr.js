import { getStateInfo, getNestInfo, getBaseInfo, updateResultType } from './parse'
import { doCopy } from '../../../spv/cloneObj'

var createUpdatedAddr = function createUpdatedAddr(addr, part, string) {
  switch (part) {
    case 'state': {
      const result = doCopy({}, addr)
      result.as_string = null
      result.state = getStateInfo(string)
      updateResultType(result)
      return result
    }
    case 'zip_name': {
      const result = doCopy({}, addr)
      result.as_string = null
      result.zip_name = string
      updateResultType(result)
      return result
    }
    case 'nesting': {
      const result = doCopy({}, addr)
      result.as_string = null
      result.nesting = getNestInfo(string)
      updateResultType(result)
      return result
    }
    case 'from_base': {
      const result = doCopy({}, addr)
      result.as_string = null
      result.from_base = getBaseInfo(string)
      updateResultType(result)
      return result
    }
    default: {
      throw new Error('not implemented')
    }
  }


}

export default createUpdatedAddr
