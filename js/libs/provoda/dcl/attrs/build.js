import cachedField from '../cachedField'
import { doCopy } from '../../../spv/cloneObj'
import shallowEqual from '../../shallowEqual'

import collectCompxs from './comp/build'
import buildInputAttrs from './input/build'
import extendByServiceAttrs from './comp/extendByServiceAttrs'

const prepareToExtendByServicingAttrs = cachedField(
  '__attrs_comp_to_be_serviced',
  ['__attrs_comp_to_be_serviced', '__attrs_base_comp', '__dcls_comp_attrs_from_effects', '__dcls_comp_attrs_from_rels'],
  false,
  (current, arg1, arg2, arg3) => {
    const result = {}

    doCopy(result, arg1)
    doCopy(result, arg2)
    doCopy(result, arg3)

    if (shallowEqual(current, result)) {
      return current
    }

    return result
  }
)

const collectAllComp = cachedField(
  '__attrs_all_comp',
  ['__attrs_all_comp', '__attrs_comp_to_be_serviced', '__dcls_comp_attrs_glue'],
  false,
  (current, arg1, arg2) => {
    const result = {}

    doCopy(result, arg2)

    for (var name in arg1) {
      if (!arg1.hasOwnProperty(name)) {
        continue
      }
      if (arg2.hasOwnProperty(name)) {
        continue
      }

      result[name] = arg1[name]
    }

    if (shallowEqual(current, result)) {
      return current
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
