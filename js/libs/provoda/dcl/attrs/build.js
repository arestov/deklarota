import cachedField from '../cachedField'
import copyWithSymbols from '../copyWithSymbols'
import { doCopy } from '../../../spv/cloneObj'

import collectCompxs from './comp/build'
import buildInputAttrs from './input/build'
import extendByServiceAttrs from './comp/extendByServiceAttrs'

const prepareToExtendByServicingAttrs = cachedField(
  '__attrs_comp_to_be_serviced',
  ['__attrs_comp_to_be_serviced', '__attrs_base_comp', '__dcls_comp_attrs_from_effects', '__dcls_comp_attrs_from_rels'],
  false,
  (_current, arg1, arg2, arg3) => {
    const result = {}

    doCopy(result, arg1)
    copyWithSymbols(result, arg2)
    doCopy(result, arg3)

    return result
  }
)

const collectAllComp = cachedField(
  '__attrs_all_comp',
  ['__attrs_all_comp', '__attrs_comp_to_be_serviced', '__dcls_comp_attrs_glue'],
  false,
  (_current, arg1, arg2, self) => {
    const mock = Boolean(self.mock_relations)
    const glue = mock ? {} : arg2

    const result = {}

    doCopy(result, glue)

    for (const name in arg1) {
      if (!arg1.hasOwnProperty(name)) {
        continue
      }
      if (glue.hasOwnProperty(name)) {
        continue
      }

      result[name] = arg1[name]
    }

    for (const prop of Object.getOwnPropertySymbols(arg1)) {
      result[prop] = arg1[prop]
    }

    return result
  }
)

const buildAttrsFinal = (self) => {

  prepareToExtendByServicingAttrs(self)

  if (self.hasOwnProperty('__attrs_comp_to_be_serviced')) {
    extendByServiceAttrs(self, self.__attrs_comp_to_be_serviced)
  }

  collectAllComp(self)

  collectCompxs(self)
  buildInputAttrs(self)

}

export default buildAttrsFinal
