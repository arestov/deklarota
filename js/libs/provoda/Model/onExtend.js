

import spv from 'spv'
import getTypedDcls from '../dcl-h/getTypedDcls'
import collectCompxs from '../StatesEmitter/collectCompxs'
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

var updateStatesDcls = function(self, props, original) {
  if (!props['attrs']) {
    return
  }
  var original_ext = original.__states_dcls || {}
  var __states_dcls = spv.cloneObj({}, original_ext)
  __states_dcls = spv.cloneObj(__states_dcls, props['attrs'])
  self.__states_dcls = __states_dcls

  /*
  {
    attrs: {
      full_name: null
    }
  }

  should remove cache for `full_name` (compx, effect, ect)

  */
}

var check = /initStates/gi

var warnV2Bad = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  console.warn('handling_v2_init = false')
}

var checkSideeffects = function(self, props, typed_state_dcls, params) {

  collectStateChangeHandlers(self, props, typed_state_dcls)
  checkEffects(self, props, typed_state_dcls)

  var init = params && params.init || props.init
  if (init) {
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
}

var checkNests = function(self, props) {
  checkNestRqC(self, props)
  checkNestSel(self, props)
  checkNestCnt(self, props)
  checkNest(self, props)
  checkModernNests(self, props)
}

export default function(self, props, original, params) {
  updateStatesDcls(self, props, original)
  var typed_state_dcls = getTypedDcls(props['attrs']) || {}

  checkSideeffects(self, props, typed_state_dcls, params)

  collectCompxs(self, props, typed_state_dcls && typed_state_dcls['compx'])
  buildInputAttrs(self, props, typed_state_dcls && typed_state_dcls['input'])


  collectSubpages(self, props)
  checkSubpager(self, props)
  checkRoutes(self, props)

  checkNests(self, props)

  checkPasses(self, props)


  checkChi(self, props)

  if (props.default_states) {
    console.warn(
      'use attrs.input to define default attr, check «dk/dcl/attrs/input helper',
      self.model_name,
      self.__code_path
    )
  }

  self._attrs_collector = null
}
