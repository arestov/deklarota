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
  ['__default_attrs', '__default_attrs_user', '_states_reqs_list', '_nest_reqs'],
  (current, arg1, attrs_reqs_list, rels_reqs_list) => {
    const result = {}

    doCopy(result, arg1)

    if (attrs_reqs_list) {
      for (const req_dcl of attrs_reqs_list) {
        doCopy(result, req_dcl.expected_attrs)
      }
    }

    if (rels_reqs_list) {
      for (const key in rels_reqs_list) {
        if (Object.hasOwnProperty.call(rels_reqs_list, key)) {
          const req_dcl = rels_reqs_list[key]
          doCopy(result, req_dcl.expected_attrs)
        }
      }
    }

    if (shallowEqual(current, result)) {
      return current
    }

    return result
  }
]


export default function(self) {
  self.__default_attrs_user = userInput(self) || self.__default_attrs_user
};
