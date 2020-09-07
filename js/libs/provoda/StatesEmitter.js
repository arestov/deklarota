import spv from '../spv'
import utils_simple from './utils/simple'
import updateProxy from './updateProxy'
import Eventor from './Eventor'
import useInterface from './StatesEmitter/useInterface'
import gentlyUpdateAttr from './StatesEmitter/gentlyUpdateAttr'
import deliverChainUpdates from './Model/mentions/deliverChainUpdates'
import regfr_lightstev from './internal_events/light_attr_change/regfire'
import getNameByAttr from './internal_events/light_attr_change/getNameByAttr'
import subscribeToDie from './internal_events/die/subscribe'
import _updateAttr from './_internal/_updateAttr'
import onPropsExtend from './onExtendSE'
import act from './dcl/passes/act'
import pvState from './utils/state'
import initEffectsSubscribe from './dcl/effects/legacy/subscribe/init'

var getLightConnector = spv.memorize(function(state_name) {
  return function updateStateBindedLightly(value) {
    _updateAttr(this, state_name, value)
  }
})


// Eventor.extendTo(StatesEmitter,
function props(add) {

var EvConxOpts = function(context, immediately) {
  this.context = context
  this.immediately = immediately
  Object.freeze(this)
}

add({
  __act: act,
  dispatch: function(action_name, data) {
    this._calls_flow.pushToFlow(act, this, [this, action_name, data])
  },
  onDie: function(cb) {
    subscribeToDie(this, cb)
  },
  // init: function(){
  // 	this._super();


  // 	return this;
  // },
  useInterface: function(interface_name, obj, destroy) {
    useInterface(this, interface_name, obj, destroy)
  },
  'regfr-lightstev': regfr_lightstev,
  getContextOptsI: function() {
    if (!this.conx_optsi) {
      this.conx_optsi = new EvConxOpts(this, true)
    }
    return this.conx_optsi
  },
  ___attrsToSync: function() {
    return this.states
  },
  getContextOpts: function() {
    if (!this.conx_opts) {
      this.conx_opts = new EvConxOpts(this)
    }
    return this.conx_opts
  },
  _bindLight: function(donor, state_name, cb) {
    var event_name = utils_simple.getSTEVNameLight(state_name)
    donor.evcompanion._addEventHandler(event_name, cb, this)

    if (this == donor || !(this instanceof StatesEmitter)) {
      return
    }

    this.onDie(function() {
      if (!donor) {
        return
      }
      this.removeLwch(donor, state_name, cb)
      donor = null
      cb = null
    })
  },
  lwch: function(donor, donor_state, func) {
    this._bindLight(donor, donor_state, func)
  },
  removeLwch: function(donor, donor_state, func) {
    donor.evcompanion.off(utils_simple.getSTEVNameLight(donor_state), func, false, this)
  },

  wlch: function(donor, donor_state, acceptor_state_name) {
    var cb = getLightConnector(acceptor_state_name, donor_state)

    var event_name = utils_simple.getSTEVNameLight(donor_state)
    donor.evcompanion._addEventHandler(event_name, cb, this)
  },
  unwlch: function(donor, donor_state, acceptor_state_name) {
    var cb = getLightConnector(acceptor_state_name, donor_state)
    this.removeLwch(donor, donor_state, cb)
  },
  onExtend: function(props, original) {
    onPropsExtend(this, props, original)
  }
})

add({
//	full_comlxs_list: [],
  compx_check: {},
//	full_comlxs_index: {},
  state: function(state_path) {
    return pvState(this, state_path)
  },
  getAttr: function(state_path) {
    return pvState(this, state_path)
  },
  __getPublicAttrs: function() {
    return this._attrs_collector.public_attrs
  }
})

var updateAttr = function(state_name, value, opts) {
  gentlyUpdateAttr(this, state_name, value, opts)
}

var updateManyAttrs = function(obj) {
  var changes_list = []
  for (var state_name in obj) {
    if (obj.hasOwnProperty(state_name)) {
      if (this.hasComplexStateFn(state_name)) {
        throw new Error('you can\'t change complex state ' + state_name)
      }
      changes_list.push(state_name, obj[state_name])
    }
  }

  if (this._currentMotivator() != null) {
    this._updateProxy(changes_list)
    return
  }

  var self = this
  this.input(function() {
    self._updateProxy(changes_list)
  })

}

add({


  updateManyStates: updateManyAttrs,
  updateManyAttrs: updateManyAttrs,
  updateState: updateAttr,
  updateAttr: updateAttr,
  setStateDependence: function(state_name, source_id, value) {
    if (typeof source_id == 'object') {
      source_id = source_id._provoda_id
    }
    var old_value = this.state(state_name) || {index: {}, count: 0}
    old_value.index[source_id] = value ? true : false

    var count = 0

    for (var prop in old_value.index) {
      if (!old_value.index.hasOwnProperty(prop)) {
        continue
      }
      if (old_value.index[prop]) {
        count++
      }
    }



    _updateAttr(this, state_name, {
      index: old_value.index,
      count: count
    })


  },
  hasComplexStateFn: function(state_name) {
    return this.compx_check[state_name]
  },

  _updateProxy: function(changes_list, opts) {
    updateProxy(this, changes_list, opts)
  },
  __count_lightevent_subscriber: function(attr_name) {
    var light_name = getNameByAttr(attr_name)
    var light_cb_cs = this.evcompanion.getMatchedCallbacks(light_name)

    return light_cb_cs ? light_cb_cs.length : 0
  },
  __deliverChainUpdates: function(chain) {
    deliverChainUpdates(this, chain)
  }
})
}

var StatesEmitter = spv.inh(Eventor, {
  naming: function(construct) {
    return function StatesEmitter() {
      construct(this)
    }
  },
  init: function(self) {
    self.conx_optsi = null
    self.conx_opts = null
    self.current_motivator = self.current_motivator || null

    initEffectsSubscribe(self)

  },
  onExtend: onPropsExtend,
  props: props,
})

export default StatesEmitter
