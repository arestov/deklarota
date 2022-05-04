import spv from '../spv'
import utils_simple from './utils/simple'
import updateProxy from './updateProxy'
import Eventor from './Eventor'
import useInterface, { __reportInterfaceChange, __updateInteraceState } from './StatesEmitter/useInterface'
import gentlyUpdateAttr from './StatesEmitter/gentlyUpdateAttr'
import attr_events from './StatesEmitter/attr_events'
import deliverChainUpdates from './Model/mentions/deliverChainUpdates'
import regfr_lightstev from './internal_events/light_attr_change/regfire'
import getNameByAttr from './internal_events/light_attr_change/getNameByAttr'
import _updateAttr from './_internal/_updateAttr'
import onPropsExtend from './onExtendSE'
import act from './dcl/passes/act'
import pvState from './utils/state'
import initEffectsSubscribe from './dcl/effects/legacy/subscribe/init'
import useInterfaceAsSource from './dcl/effects/transaction/start'

const getLightConnector = spv.memorize(function(state_name) {
  return function updateStateBindedLightly(value) {
    _updateAttr(this, state_name, value)
  }
})


// Eventor.extendTo(StatesEmitter,
function props(add) {

  add(attr_events)

  add({
    getInterface: function(interface_name) {
      return this._interfaces_used[interface_name]
    },
    __updateInteraceState: __updateInteraceState,
    __reportInterfaceChange: __reportInterfaceChange,
    useInterface: function(interface_name, obj, destroy) {
      useInterface(this, interface_name, obj, destroy)
    },

    inputFromInterface: function(interface_instance, fn) {
      if (interface_instance == null) {
        throw new Error('api instance should be provided')
      }

      // expecting new transaction will be started
      this._getCallsFlow().pushToFlow(fn, this, null, interface_instance, useInterfaceAsSource)
    },
  })

  add({
    __act: act,
    dispatch: function(action_name, data) {
      this._calls_flow.pushToFlow(act, this, [this, action_name, data])
    },
  // init: function(){
  // 	this._super();


  // 	return this;
  // },
    'regfr-lightstev': regfr_lightstev,

    ___attrsToSync: function() {
      return this.states
    },


    wlch: function(donor, donor_state, acceptor_state_name) {
      const cb = getLightConnector(acceptor_state_name, donor_state)

      const event_name = utils_simple.getSTEVNameLight(donor_state)
      donor.evcompanion._addEventHandler(event_name, cb, this, null, null, true)
    },
    unwlch: function(donor, donor_state, acceptor_state_name) {
      const cb = getLightConnector(acceptor_state_name, donor_state)
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

  const updateAttr = function(state_name, value, opts) {
    gentlyUpdateAttr(this, state_name, value, opts)
  }

  const updateManyAttrs = function(obj) {
    const changes_list = []
    for (const state_name in obj) {
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

    const self = this
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
      const old_value = this.state(state_name) || {index: {}, count: 0}
      old_value.index[source_id] = value ? true : false

      let count = 0

      for (const prop in old_value.index) {
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
      const light_name = getNameByAttr(attr_name)
      const light_cb_cs = this.evcompanion.getMatchedCallbacks(light_name)

      return light_cb_cs ? light_cb_cs.length : 0
    },
    __deliverChainUpdates: function(chain) {
      deliverChainUpdates(this, chain)
    },
    _throwError(msg, context) {
      const err = msg instanceof Error ? msg : new Error(msg)
      console.error(err, '\n', context, '\n', this.__code_path)
      throw err
    },
    _warnError(msg, context) {
      const err = msg instanceof Error ? msg : new Error(msg)
      console.warn(err, '\n', context, '\n', this.__code_path)
    }
  })
}

const StatesEmitter = spv.inh(Eventor, {
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
