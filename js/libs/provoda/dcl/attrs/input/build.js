import cachedField from '../../cachedField'
import { doCopy } from '../../../../spv/cloneObj'
import shallowEqual from '../../../shallowEqual'

const userInput = (self) => {
  if (!self.hasOwnProperty('__attrs_base_input')) {return}

  const byName = self.__attrs_base_input

  const result = {}
  for (const attr_name in byName) {
    const cur = byName[attr_name]
    result[attr_name] = cur[0]
  }

  return result
}

export const __default_attrs = [
  ['__default_attrs', '__default_attrs_user'],
  (current, arg1) => {
    const result = {}

    doCopy(result, arg1)

    if (shallowEqual(current, result)) {
      return current
    }

    return result
  }
]


export default function(self) {
  self.__default_attrs_user = userInput(self) || self.__default_attrs_user
};
