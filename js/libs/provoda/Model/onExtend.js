

import spv from '../../spv'
import getTypedDcls from '../dcl-h/getTypedDcls'
import collectCompxs from '../dcl/attrs/comp/build'
import parseCompItems from '../dcl/attrs/comp/parseItems'
import buildInputAttrs from '../dcl/attrs/input/build'
import checkChi from '../StatesEmitter/checkChi'

import checkNestRqC from '../dcl/nest_model/check'
import checkNestSel from '../dcl/nest_sel/check'
import checkNestCnt from '../dcl/nest_conj/check'

import checkModernNests from '../dcl/nests/check'
import checkPasses from '../dcl/passes/check'
import checkRoutes from '../dcl/routes/check'
import checkSubpager from '../dcl/sub_pager/check'
import collectSubpages from '../dcl/sub_pager/collectSubpages'
import checkEffects from '../dcl/effects/check'

import checkNest from '../dcl/nest/check'

import collectStateChangeHandlers from '../dcl/m-collectStateChangeHandlers'

var copyProps = function(original_props_raw, extending_values) {
  if (!extending_values) {
    return original_props_raw
  }

  var original_props = original_props_raw || {}
  var result = spv.cloneObj({}, original_props)
  return spv.cloneObj(result, extending_values)
}

var check = /initStates/gi

var warnV2Bad = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  console.warn('handling_v2_init = false')
}

var checkSideeffects = function(self, props, params) {

  var init = params && params.init || props.init
  if (!init) {
    return
  }

  // 1 == self, 2 == opts, 3 == data, 4 == params, 5 == more, 6 == states

  if (self.net_head || (init.length > 2 && !self.hasOwnProperty('handling_v2_init'))) {
    // `handling_v2_init` is mark for invoker that it can pass new structure to Constr
    // means that init fn can handle both legacy and v2 structure
    self.handling_v2_init = false

    warnV2Bad()
  }

  if (init.length > 2 && !self.hasOwnProperty('network_data_as_states')) {
    self.network_data_as_states = false
  }
  if (self.toString().search(check) != -1) {
    self.manual_states_init = true
  }
}

export default function(self, props, original, params) {
  /** LEGACY CHEKS **/

  checkNestRqC(self, props)
  checkNestSel(self, props)
  checkNestCnt(self, props)
  checkNest(self, props)

  checkSideeffects(self, props, params)

  if (props.default_states) {
    console.warn(
      'use attrs.input to define default attr, check «dk/dcl/attrs/input helper',
      self.model_name,
      self.__code_path
    )
  }


  self.__dcls_attrs = copyProps(original.__states_dcls, props['attrs'])
  self.__dcls_rels = copyProps(original.__dcls_rels, props['rels'])
  self.__dcls_routes = copyProps(original.__dcls_routes, props['routes'])
  self.__dcls_actions = copyProps(original.__dcls_actions, props['actions'])

  var effects = props['effects']
  self.__dcls_effects_api = copyProps(original.__dcls_effects_api, effects && effects['api'])
  self.__dcls_effects_consume = copyProps(original.__dcls_effects_consume, effects && effects['consume'])
  self.__dcls_effects_produce = copyProps(original.__dcls_effects_produce, effects && effects['produce'])


  var typed_state_dcls = getTypedDcls(props['attrs']) || {}

  checkEffects(self, props, typed_state_dcls)
  collectStateChangeHandlers(self, props)

  parseCompItems(self, typed_state_dcls && typed_state_dcls['comp'])

  collectCompxs(self, props, typed_state_dcls && typed_state_dcls['comp'])
  buildInputAttrs(self, props, typed_state_dcls && typed_state_dcls['input'])


  collectSubpages(self, props)
  checkSubpager(self, props)
  checkRoutes(self, props)

  checkModernNests(self, props)

  checkPasses(self, props)


  checkChi(self, props)


  self._attrs_collector = null
}
