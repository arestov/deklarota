import { getStateInfo, getNestInfo, getBaseInfo, updateResultType } from './parse'
import { doCopy } from '../../../spv/cloneObj'

var createUpdatedAddr = function createUpdatedAddr(addr, part, string) {
  const result = doCopy({}, addr)

  switch (part) {
    case 'state': {
      result.as_string = null
      result.state = getStateInfo(string)
      updateResultType(result)
      return result
    }
    case 'zip_name': {
      result.as_string = null
      result.zip_name = string
      updateResultType(result)
      return result
    }
    case 'nesting': {
      result.as_string = null
      result.nesting = getNestInfo(string)
      updateResultType(result)
      return result
    }
    case 'from_base': {
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
