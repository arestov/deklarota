
import initDeclaredNestings from '../initDeclaredNestings'
import prsStCon from '../prsStCon'
import nestWIndex from '../nest-watch/index'
import initNestSel from '../dcl/nest_sel/init'
import initNestConcat from '../dcl/nest_conj/init'
import initNestCompx from '../dcl/nest_compx/init'
import initApis from '../dcl/effects/legacy/api/init'
import initRoutes from '../dcl/routes/init'
import __handleInit from '../dcl/passes/handleInit/handle'
import initInputAttrs from '../dcl/attrs/input/init'

import { createFakeEtr, computeInitialAttrs, getComplexInitList } from '../updateProxy'

import _updateAttr from '../_internal/_updateAttr'
var initWatchList = nestWIndex.initList

function ensureInitialAttrs(self) {
  if (self._fake_etr != null) {
    return
  }

  var first_changes_list = getComplexInitList(self) || []

  for (var i = 0; i < self.__defined_attrs_bool.length; i++) {
    var cur = self.__defined_attrs_bool[i]
    if (cur.type != 'bool') {
      continue
    }
    first_changes_list.push(cur.name, false)
  }


  var default_attrs = initInputAttrs(self)
  for (var attr_name in default_attrs) {
    first_changes_list.push(attr_name, default_attrs[attr_name])
  }

  var fake = createFakeEtr(self, first_changes_list)

  computeInitialAttrs(fake.etr, fake.total_original_states, fake.total_ch, fake.states_changing_stack)
  self.constructor.prototype._fake_etr = fake
}

function connectStates(self) {
  // prefill own states before connecting relations
  ensureInitialAttrs(self)

  self.__initStates()

  prsStCon.connect.parent(self, self)
  prsStCon.connect.root(self, self)
  prsStCon.connect.nesting(self, self)

  initWatchList(self, self.compx_nest_matches)
}

function connectNests(self) {
  if (self.nestings_declarations) {
    self.nextTick(initDeclaredNestings, null, false, self.current_motivator)
  }

  initNestSel(self)
  initNestConcat(self)
  initNestCompx(self)
}

function markInitied(md) {
  // - this state shuld be true when all preparations, all initial triggers and subscribtions are done
  // - use it to not produce effects for states changes during initialization
  _updateAttr(md, '$meta$inited', true)
}

export default function postInitModel(self, opts) {
  connectStates(self)
  connectNests(self)

  initWatchList(self, self.st_nest_matches)
  initRoutes(self)


  if (self.init_v2_data) {
    __handleInit(self, self.init_v2_data)
    self.init_v2_data = null
  } else {
    __handleInit(self, null)
  }

  initApis(self, opts && opts.interfaces)

  self.nextTick(markInitied, null, false, self.current_motivator)
  Object.seal(self)
}
