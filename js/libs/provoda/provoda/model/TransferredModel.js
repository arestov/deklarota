import spv from '../../../spv'
import initApis from '../../dcl/effects/legacy/api/init'
import { makeTasks, runScheduledEffects } from '../../StatesEmitter/produceEffects'
import useInterface from '../../StatesEmitter/useInterface'
import attr_events from '../../StatesEmitter/attr_events'
// import FastEventor from '../../FastEventor/index'
import initEffectsSubscribe from '../../dcl/effects/legacy/subscribe/init'
import Eventor from '../../Eventor'
import hndMotivationWrappper from '../../helpers/hndMotivationWrappper'
import getDepValue from '../../utils/multiPath/getDepValue'
import parseAddr from '../../utils/multiPath/parse'
import addrFromObj from '../dcl/addr.js'


var getParsedAddr = function(addr) {
  if (typeof addr == 'object') {
    return parseAddr(addrFromObj(addr))
  }
  return parseAddr(addr)
}


var TransferredModel = spv.inh(Eventor, {
  naming: function(fn) {
    return function TransferredModel(constrp, __sendToState, _highway, app, id, parent) {
      fn(this, constrp, __sendToState, _highway, app, id, parent)
    }
  },

  init: function(self, constrp, __sendToState, _highway, app, id, parent) {

    self.app = app
      ? app
      : (id === 1
          ? self
          : null)

    self._highway = _highway
    self.__sendToState = __sendToState
    self._calls_flow = self._highway.calls_flow

    self._provoda_id = id
    self.map_parent = parent
    self.attrs = null
    self.children_models = {}
    self.rt_schema = constrp

    self.current_motivator = null
    self._effects_using = null
    initEffectsSubscribe(self)


    // self.evcompanion = new FastEventor(self)

    Object.seal(self)
  },
  props: collectProps
})



function collectProps(add) {


  add({
    sendCall: function(...payload) {
      this.__sendToState([this._provoda_id, ...payload])
    }
  })

  add(attr_events)

  function getAttr(attr_name) {
    return this.attrs[attr_name]
  }

  function updateAttr(attr_name, value) {
    this.sendCall('updateAttr', attr_name, value)
  }

  function updateManyAttrs(attrs_map) {
    this.sendCall('updateManyAttrs', attrs_map)
  }

  const getRel = function(rel_name) {
    return this.children_models && this.children_models[rel_name]
  }

  const itemToId = item => item && item._provoda_id

  const valueToIds = value => {
    if (!Array.isArray(value)) {
      return itemToId(value)
    }

    return value.map(itemToId)
  }


  add({
    __count_lightevent_subscriber: () => {},

    wasDisposed: function() {
      console.warn('make wasDisposed work')

      return false
    },

    getInstanceKey: function() {
      return this._provoda_id
    },
    readAddr: function(addr) {
      var parsed = getParsedAddr(addr)
      return getDepValue(this, parsed)
    },
        getAttr: getAttr,
    state: getAttr,
    // resetRequestedState: imp,
    updateAttr: updateAttr,
    updateManyAttrs: updateManyAttrs,
    updateManyStates: updateManyAttrs,

    getRel: getRel,
    getNesting: getRel,
    updateRel: function(rel_name, value) {
      this.sendCall('updateRel', rel_name, valueToIds(value))
    },

    getStrucRoot: function() {
      return this.app
    },
  })

  add({
    _getCallsFlow: function() {
      // disable this._local_calls_flow || for some time!
      return this._calls_flow
    },
    _currentMotivator: function() {
      return this._getCallsFlow().current_step
    },
    input: function(fn) {
      this._getCallsFlow().input(fn)
    },
    nextTick: function(fn, args, use_current_motivator, initiator) {
      return this._calls_flow.pushToFlow(
        fn, this, args, !args && this, hndMotivationWrappper, this, use_current_motivator && this.current_motivator, false,
        initiator, fn.init_end
      )
    },
  })

  // _bindLight: function(donor, state_name, cb) {
  //   var event_name = utils_simple.getSTEVNameLight(state_name)
  //   donor.evcompanion._addEventHandler(event_name, cb, this)
  //
  //   this.onDie(function() {
  //     if (!donor) {
  //       return
  //     }
  //     this.removeLwch(donor, state_name, cb)
  //     donor = null
  //     cb = null
  //   })
  // },
  // lwch: function(donor, donor_state, func) {
  //   this._bindLight(donor, donor_state, func)
  // },
  // removeLwch: function(donor, donor_state, func) {
  //   donor.evcompanion.off(utils_simple.getSTEVNameLight(donor_state), func, false, this)
  // },

  const interfaceEventName = (interface_name) => {
    return `api-${interface_name}`
  }

  add({
    watchInterface: function(donor, interface_name, fn) {
      donor.evcompanion._addEventHandler(interfaceEventName(interface_name), fn, this)
    },
    unwatchInterface: function(donor, interface_name, fn) {
      donor.evcompanion.off(interfaceEventName(interface_name), fn, false, this)
    },
    __reportInterfaceChange: function(interface_name, value) {

      this.__updateInteraceState(interface_name, value)

      console.log('__reportInterfaceChange', interface_name, value)

      const event_name = interfaceEventName(interface_name)

      var callbacks = this.evcompanion.getMatchedCallbacks(event_name)
      if (callbacks == null || !callbacks.length) {
        return
      }

      this.evcompanion.triggerCallbacks(callbacks, false, false, event_name, value)

    },
    __updateInteraceState: function(interface_name, value) {
      this.sendCall('__updateInteraceState', interface_name, value)
    },
    useInterface: function(interface_name, obj, destroy) {
      useInterface(this, interface_name, obj, destroy)
    },
  })

}



export default TransferredModel
export { initApis, makeTasks, runScheduledEffects }