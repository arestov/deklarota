import cachedField from '../../cachedField'
import { doCopy } from '../../../../spv/cloneObj'
import shallowEqual from '../../../shallowEqual'

const userInput = (self) => {
  if (!self.hasOwnProperty('__attrs_base_input')) {return}

  var byName = self.__attrs_base_input

  var result = {}
  for (var attr_name in byName) {
    var cur = byName[attr_name]
    result[attr_name] = cur[0]
  }

  return result
}

const serviceInput = (self) => {
  if (!self.hasOwnProperty('_nest_reqs')) {return}

  var has_loader = !!(self._nest_reqs && self._nest_reqs[self.main_list_name])
  if (!has_loader) { return}

  return {
    has_data_loader: true,
  }

}

const checkParts = cachedField(
  '__default_attrs',
  ['__default_attrs', '__default_attrs_user', '__default_attrs_service'],
  false,
  (current, arg1, arg2) => {
    const result = {}

    doCopy(result, arg1)
    doCopy(result, arg2)

    if (shallowEqual(current, result)) {
      return current
    }

    return result
  }
)


export default function(self) {
  self.__default_attrs_user = userInput(self) || self.__default_attrs_user
  self.__default_attrs_service = serviceInput(self) || self.__default_attrs_service

  checkParts(self)
};
