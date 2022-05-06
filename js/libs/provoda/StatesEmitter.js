import spv from '../spv'
import updateProxy from './updateProxy'
import Eventor from './Eventor'
import useInterface, { __reportInterfaceChange, __updateInteraceState } from './StatesEmitter/useInterface'
import gentlyUpdateAttr from './StatesEmitter/gentlyUpdateAttr'
import regfr_lightstev from './internal_events/light_attr_change/regfire'
import getNameByAttr from './internal_events/light_attr_change/getNameByAttr'
import onPropsExtend from './onExtendSE'
import act from './dcl/passes/act'
import pvState from './utils/state'
import initEffectsSubscribe from './dcl/effects/legacy/subscribe/init'
import { FlowStepAction } from './Model/flowStepHandlers.types'
import { WFlowStepUseInterfaceAsSource } from './flowStepsWrappers.type'


export const __updateManyAttrs = function(obj) {
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
// Eventor.extendTo(StatesEmitter,
function props(add) {

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
      this._getCallsFlow().pushToFlow(fn, this, null, interface_instance, WFlowStepUseInterfaceAsSource)
    },
  })

  add({
    __act: act,
    dispatch: function(action_name, data) {
      this._calls_flow.pushToFlow(FlowStepAction, this, [this, action_name, data])
    },
  // init: function(){
  // 	this._super();


  // 	return this;
  // },
    'regfr-lightstev': regfr_lightstev,

    ___attrsToSync: function() {
      return this.states
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

  add({


    updateManyStates: __updateManyAttrs,
    updateManyAttrs: __updateManyAttrs,
    updateState: updateAttr,
    updateAttr: updateAttr,
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

    initEffectsSubscribe(self)

  },
  onExtend: onPropsExtend,
  props: props,
})

export default StatesEmitter
