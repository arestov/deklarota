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
import { startFetching } from '../../FastEventor/requestNesting'
import getLinedStructure from '../../Model/getLinedStructure'
import toTransferableNestings from '../../Model/toTransferableNestings'
// import toTransferableStatesList from '../../Model/toTransferableStatesList'
import isPrivate from '../../Model/isPrivateState'

var CH_GR_LE = 2

var getParsedAddr = function(addr) {
  if (typeof addr == 'object') {
    return parseAddr(addrFromObj(addr))
  }
  return parseAddr(addr)
}

var MDReplace = function(_provoda_id) {
  this._provoda_id = _provoda_id
}

var TransferredModel = spv.inh(Eventor, {
  naming: function(fn) {
    return function TransferredModel(constrp, __sendToState, _highway, getModelById, app, id, parent) {
      fn(this, constrp, __sendToState, _highway, getModelById, app, id, parent)
    }
  },

  init: function(self, constrp, __sendToState, _highway, getModelById, app, id, parent) {

    self.app = app
      ? app
      : (id === 1
          ? self
          : null)

    self._highway = _highway
    self.__sendToState = __sendToState
    self.__getModelById = getModelById
    self._calls_flow = self._highway.calls_flow

    self._provoda_id = id
    self.map_parent = parent
    self.attrs = null
    self.public_attrs = null
    self.children_models = {}
    self.rt_schema = constrp
    self.md_replacer = null

    self.current_motivator = null
    self._effects_using = null
    initEffectsSubscribe(self)

    self.extra = self.rt_schema.use_extra ? {} : null


    // self.evcompanion = new FastEventor(self)

    Object.seal(self)
  },
  props: collectProps
})



function collectProps(add) {


  add({
    is_messaging_model: true,
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
    getLinedStructure: function(...args) {
      return getLinedStructure.apply(this, args)
    },
    _assignPublicAttrs: function(target) {
      Object.assign(target, this.public_attrs)
    },
    __assignRelChanges: function(rel_name, value, old_value, removed) {
      this.children_models[rel_name] = value
      this._highway.views_proxies.pushNesting(this, rel_name, value, old_value, removed)
    },
    __assignChanges: function(changes_list) {
      if (!this.attrs) {
        this.attrs = {}
        this.public_attrs = {}

        initApis(this)
      }

      var dubl = []

      for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
        const attr = changes_list[i]
        const value = changes_list[i + 1]

        this.attrs[attr] = value

        if (!isPrivate(attr)) {
          this.public_attrs[attr] = value
          dubl.push(attr, value)
        }
      }

      if (this._highway.views_proxies != null) {
        this._highway.views_proxies.pushStates(this, dubl)
      }
    }
  })


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
    ___attrsToSync: function() {
      return this.public_attrs
    },
        getAttr: getAttr,
    state: getAttr,
    // resetRequestedState: imp,
    updateAttr: updateAttr,
    updateManyAttrs: updateManyAttrs,
    updateManyStates: updateManyAttrs,
    getSPI: ()=> {
      console.error('getSPI')
    },

    dispatch: function(...args) {
      this.sendCall('dispatch', ...args)
    },

    getRel: getRel,
    getNesting: getRel,
    updateRel: function(rel_name, value) {
      this.sendCall('updateRel', rel_name, valueToIds(value))
    },

    RPCLegacy: function(...args) {
      this.sendCall('RPCLegacy', ...args)
    },

    getStrucRoot: function() {
      return this.app
    },
    getStrucParent: function() {
      return this.map_parent
    },
    getMDReplacer: function() {
      if (!this.md_replacer) {
        this.md_replacer = new MDReplace(this._provoda_id)
      }
      return this.md_replacer
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
    getInterface: function(interface_name) {
      return this._interfaces_using && this._interfaces_using.used[interface_name]
    },
    watchInterface: function(donor, interface_name, fn) {
      donor.evcompanion._addEventHandler(interfaceEventName(interface_name), fn, this)
      this.nextTick(fn, [Boolean(donor.getInterface(interface_name))], true)
    },
    unwatchInterface: function(donor, interface_name, fn) {
      donor.evcompanion.off(interfaceEventName(interface_name), fn, false, this)
    },
    __reportInterfaceChange: function(interface_name, value) {

      this.__updateInteraceState(interface_name, value)

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

  add({
    requestMoreData: function(rel_name) {
      this.sendCall('requestMoreData', rel_name)
    }
  })

}



export default TransferredModel
export { initApis, makeTasks, runScheduledEffects, startFetching, toTransferableNestings }
