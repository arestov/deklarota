import { cacheFields } from '../dcl/cachedField'
import { hasOwnProperty } from '../hasOwnProperty'
import isRelAddr from '../utils/multiPath/isRelAddr'
import validateViewAddr from './validateViewAddr'

const schema = {
  __validated_views_attrs: [
    ['__attrs_comp_to_be_serviced'],
    (v) => {

      for (const prop of Object.getOwnPropertySymbols(v)) {
        const cur = v[prop]
        cur.addrs.forEach(validateViewAddr)
      }

      for (const prop in v) {
        if (!hasOwnProperty(v, prop)) {
          continue
        }
        const cur = v[prop]
        cur.addrs.forEach(validateViewAddr)
      }
    },
  ],
  $view$externals_deps: [
    ['__attrs_uniq_external_deps'],
    (values) => {
      if (!values) {
        return null
      }

      return values.filter(isRelAddr)
    },
  ]
}

const validateViewAttrs = (self) => {
  cacheFields(schema, self)
}

export default validateViewAttrs
