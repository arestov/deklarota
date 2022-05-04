import { cacheFields } from '../dcl/cachedField'
import { hasOwnProperty } from '../hasOwnProperty'
import validateModelAttrAddr from './validateModelAttrAddr'

const props = {
  __validated_schema: [
    ['__attrs_comp_to_be_serviced', '__code_path'],
    (attrs, code_path) => {
      if (!attrs) {
        return
      }

      const validate = (addr) => {
        validateModelAttrAddr(addr, code_path)
      }

      for (const prop of Object.getOwnPropertySymbols(attrs)) {
        const cur = attrs[prop]
        cur.addrs.forEach(validate)
      }

      for (const prop in attrs) {
        if (!hasOwnProperty(attrs, prop)) {
          continue
        }
        const cur = attrs[prop]
        cur.addrs.forEach(validate)
      }

    }
  ]
}

const validateModelSchema = (self) => {
  cacheFields(props, self)
}

export default validateModelSchema
