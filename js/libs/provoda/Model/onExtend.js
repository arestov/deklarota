import extendDclCache from '../dcl/extendDclCache'
import assignField from '../dcl/assignField'

import getTypedDcls from '../dcl-h/getTypedDcls'
import parseCompItems from '../dcl/attrs/comp/parseItems'
import buildAttrsFinal from '../dcl/attrs/build'
import checkChi, { checkChiProps } from '../StatesEmitter/checkChi'

import checkNestRqC from '../dcl/nest_model/check'
import checkNestSel from '../dcl/nest_sel/check'
import checkNestCnt from '../dcl/nest_conj/check'

import checkModernNests from '../dcl/nests/check'
import checkPasses from '../dcl/passes/check'
import checkRoutes from '../dcl/routes/check'
import checkSubpager from '../dcl/sub_pager/check'
import collectSubpages, { depricateOldSubpages } from '../dcl/sub_pager/collectSubpages'
import checkEffects from '../dcl/effects/check'

import checkNest from '../dcl/nest/check'

import collectStateChangeHandlers from '../dcl/m-collectStateChangeHandlers'

const check = /initStates/gi

const checkSideeffects = function(self, props, params) {

  const init = params && params.init || props.init
  if (!init) {
    return
  }

  // 1 == self, 2 == opts, 3 == data, 4 == params, 5 == more, 6 == states

  if (self.net_head || (init.length > 2 && !self.hasOwnProperty('handling_v2_init'))) {
    // `handling_v2_init` is mark for invoker that it can pass new structure to Constr
    // means that init fn can handle both legacy and v2 structure
    self.handling_v2_init = false

    throw new Error('handling_v2_init = false')
  }

  if (self.toString().search(check) != -1) {
    self.manual_states_init = true
  }
}

export const completeBuild = (self) => {
  const typed_state_dcls = getTypedDcls(self.__dcls_attrs || {})
  parseCompItems(typed_state_dcls && typed_state_dcls['comp'])

  assignField(self, '__attrs_base_comp', typed_state_dcls['comp'] || {})
  assignField(self, '__attrs_base_input', typed_state_dcls['input'] || {})

  checkEffects(self)

  collectSubpages(self)
  checkSubpager(self)
  checkRoutes(self)

  checkModernNests(self)

  buildAttrsFinal(self)


  /*
    check global_skeleton for
    provideGlueRels(self, props)

  */

  checkPasses(self)


  checkChi(self)


  self._attrs_collector = null
}

export default function(self, props, _original, params) {
  /** LEGACY CHEKS **/

  if (props.hasOwnProperty('redirectBWLev')) { // legacy perspectivator redirects
    throw new Error('replace redirectBWLev in model by selectPreferredCursor in perspectivator')
  }

  checkNestRqC(self, props)
  checkNestSel(self, props)
  checkNestCnt(self, props)
  checkNest(self, props)

  checkSideeffects(self, props, params)

  collectStateChangeHandlers(self, props)
  depricateOldSubpages(props)
  checkChiProps(self, props)

  extendDclCache(self, '__dcls_attrs', props['attrs'])
  extendDclCache(self, '__dcls_rels', props['rels'])
  extendDclCache(self, '__dcls_routes', props['routes'])
  extendDclCache(self, '__dcls_actions', props['actions'])

  const effects = props['effects']

  extendDclCache(self, '__dcls_effects_api', effects && effects['api'])
  extendDclCache(self, '__dcls_effects_consume', effects && effects['in'])
  extendDclCache(self, '__dcls_effects_produce', effects && effects['out'])

  completeBuild(self)
}
