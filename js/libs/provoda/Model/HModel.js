
import spv from '../../spv'
import Model from '../Model'
import _updateAttr from '../_internal/_updateAttr'
import getModelById from '../utils/getModelById'
import checkAndDisposeModel from './checkAndDisposeModel'

var HModel = spv.inh(Model, {
  strict: true,
  naming: function(fn) {
    return function HModel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  preinit: function(self, opts) {

    //opts = opts || {};
    if (!self.app) {
      self.app = null
    }

    if (!self.map_parent) {
      self.map_parent = null
    }

    if (!self.skip_map_init && !self.zero_map_level) {
      if (!opts || !opts.map_parent) {
        if (!self.zero_map_level) {
          throw new Error('who is your map parent model?')
        }
      }
    }

    var map_parent = self.map_parent || opts.map_parent

    self.map_level_num = null

    if (self.zero_map_level) {
      self.map_level_num = -1
    } else {
      if (map_parent) {
        self.map_level_num = map_parent.map_level_num + 1
      }
    }

    // self._super.apply(this, arguments);
  },
}, {
  handling_v2_init: true,
  network_data_as_states: true,
  _hndOnPMDSwitch: function(e) {
    this.checkPMDSwiched(e.value)
  },
  'stch-vswitched': function(target, state, old_state) {
    if (state) {
      var md = getModelById(target, state)
      _updateAttr(md, 'pmd_vswitched', true)
    }
    if (old_state) {
      var old_md = getModelById(target, old_state)
      _updateAttr(old_md, 'pmd_vswitched', false)
    }
  },
  switchPmd: function(toggle) {
    var new_state
    if (typeof toggle == 'boolean')	{
      new_state = toggle
    } else {
      new_state = !this.state('pmd_vswitched')
    }
    var pmd_switch = this.getNesting('pmd_switch')
    if (!pmd_switch) {return}

    if (new_state) {
      if (!this.state('pmd_vswitched')) {
        _updateAttr(pmd_switch, 'vswitched', this._provoda_id)
      }
    } else {
      if (this.state('pmd_vswitched')) {
        _updateAttr(pmd_switch, 'vswitched', false)
      }
    }
  },
  checkPMDSwiched: function(value) {
    _updateAttr(this, 'pmd_vswitched', value == this._provoda_id)
  },
  effects: {
    produce: {
      __remove_model: {
        api: ['self'],
        trigger: ['$meta$removed'],
        require: ['$meta$removed'],
        fn: function(self, value) {
          checkAndDisposeModel(self, value)
        }
      }
    }
  }
})

export default HModel
