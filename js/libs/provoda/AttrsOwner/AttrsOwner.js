import updateProxy from '../updateProxy'
import useInterface, { __reportInterfaceChange, __updateInteraceState } from './useInterface'
import gentlyUpdateAttr from './gentlyUpdateAttr'
import regfr_lightstev from '../internal_events/light_attr_change/regfire'
import getNameByAttr from '../internal_events/light_attr_change/getNameByAttr'
import onPropsExtend from '../onExtendSE'
import pvState from '../utils/state'
import initEffectsSubscribe from '../dcl/effects/legacy/subscribe/init'
import { WFlowStepUseInterfaceAsSource } from '../flowStepsWrappers.type'
import calls_flows_holder_basic from './calls_flows_holder_basic'
import onInstanceInitDie from '../internal_events/die/onInstanceInit'
import spvExtend from '../../spv/inh'
import { pushRuntimeInputFn } from '../runtimeInputFns/runtimeInputFns'
import { FlowStepInputFn } from '../Model/flowStepHandlers.types'

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
  add(calls_flows_holder_basic)

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

      const num = pushRuntimeInputFn(this, fn)
      // expecting new transaction will be started
      this._getCallsFlow().pushToFlow(FlowStepInputFn, this, null, [interface_instance, num], WFlowStepUseInterfaceAsSource)
    },
  })

  add({

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

const AttrsOwner = spvExtend(function() {}, {
  naming: function(construct) {
    return function AttrsOwner() {
      construct(this)
    }
  },
  init: function(self) {

    initEffectsSubscribe(self)
    onInstanceInitDie(self)

  },
  onExtend: onPropsExtend,
  props: props,
})

export default AttrsOwner
