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

export const $attrs$expected_input$service = [
  ['_states_reqs_list', '_nest_reqs', '$attrs$expected_input$basic'],
  (attrs_reqs_list, rels_reqs_list, $attrs$expected_input$basic) => {
    const result = {
      ...$attrs$expected_input$basic,
    }


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

    return result
  }
]

export const __default_attrs = [
  ['__default_attrs', '__default_attrs_user', '$attrs$expected_input$service'],
  (current, arg1, arg2) => {
    const result = {}

    doCopy(result, arg2)
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
