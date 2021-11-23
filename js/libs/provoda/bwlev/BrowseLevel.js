
import spv from '../../spv'
import Model from '../Model'
import changeBridge from './changeBridge'
import requestPage from './requestPage'
import followFromTo from './followFromTo'
import getModelById from '../utils/getModelById'
import _updateAttr from '../_internal/_updateAttr'
import _updateRel from '../_internal/_updateRel'
import pvState from '../utils/state'
import flatStruc from '../structure/flatStruc'
import getUsageStruc from '../structure/getUsageStruc'
import initNestingsByStruc from '../structure/reactions/initNestingsByStruc'
import loadNestingsByStruc from '../structure/reactions/loadNestingsByStruc'
import loadAllByStruc from '../structure/reactions/loadAllByStruc'
import getModelSources from '../structure/getModelSources'
import showMOnMap from './showMOnMap'
import getAliveNavPioneer from './getAliveNavPioneer'

const countKeys = spv.countKeys
const cloneObj = spv.cloneObj

const transportName = function(spyglass_name) {
  return 'router__' + spyglass_name.replace('/', '__')
}

const warnStruct = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }
  console.warn('add struct')
}

const selectParentToGo = (map, pioneer, another_candidate) => {
  const alive_pioneer = getAliveNavPioneer(map, pioneer)

  if (alive_pioneer === pioneer) {
    return null
  }

  if (alive_pioneer === another_candidate) {
    return null
  }

  return showMOnMap(pioneer.app.CBWL, map, alive_pioneer)
}

const switchToAliveParent = (self) => {
  changeBridge(
    selectParentToGo(
      self.map,
      self.getNesting('pioneer'),
      self.map_parent && self.map_parent.getNesting('pioneer')) ||
    self.map_parent ||
    self.map.start_bwlev,
    self.map)
}

var BrowseLevel = spv.inh(Model, {
  naming: function(fn) {
    return function BrowseLevel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },

  postInit: function(self) {

    self.children_bwlevs = {}
    self.map = null

    // self.model_name = states['model_name'];
    //
    // if (!self.model_name) {
    // 	throw new Error('must have model name');
    // }

    const states = self.init_v2_data.states

    const pioneer = states['pioneer']

    self.ptree = [self]
    self.rtree = [pioneer]

    if (self.map_parent) {
      self.ptree = self.ptree.concat(self.map_parent.ptree)
      self.rtree = self.rtree.concat(self.map_parent.rtree)
    }
  }
}, {
  model_name: 'bwlev',
  attrs: {
    map_level_num: ['input'],
    is_main_perspectivator_resident: ['input', false],
    probe_name: ['input'],
    pioneer_provoda_id: ['input'],
    pioneer: ['input'],
    currentReq: ['input'],
    mpl_attached: ['input'],
    mp_dft: ['input'],
    mp_show: ['input'],
    mp_has_focus: ['input'],
    // bmpl_attached: ['input'],
    mpl_attached: ['input'],
    'check_focus_leave': [
      'comp',
      ['mp_has_focus'],
    ],
    pioneer_removed: [
      'comp',
      ['< @one:$meta$removed < pioneer'],
    ],
    'navigation_unavailable': [
      'comp',
      ['< @one:prpt_navigation_available < pioneer', 'pioneer_removed', '< @one:nav_item_removed < pioneer'],
      (nav_available, removed, legacy_removed) => {
        /*
           prpt_navigation_available allows to define custom logic
           e.g. can redefine logic and be navigated to removed item
        */

        if (nav_available != null) {
          return !nav_available
        }

        return Boolean(removed || legacy_removed)
      },
    ],
    'should_be_redirected': [
      'comp',
      ['navigation_unavailable', '< @one:_provoda_id < pioneer <<', 'mp_show'],
      function(state, _provoda_id, show) {
        return state && show && _provoda_id
      }
    ],
    'source_of_item': [
      'comp',
      ['<< @one:pioneer <<'],
      function(pioneer) {
        if (!pioneer) {
          return
        }

        return pioneer._network_source
      }
    ],
    'sources_of_item_details_by_space': [
      'comp',
      ['struc', '<< @one:pioneer <<'],
      function(struc, pioneer) {
        if (!pioneer) {return}

        return getStrucSources(pioneer, struc)
      }
    ],
    enabled_loading: [
      'comp',
      ['< @one:disable_auto_loading < map <<'],
      function(disabled) {
        return !disabled
      }
    ],

    'struc': [
      'comp',
      ['enabled_loading',
        '< @one:used_data_structure < map <<',
        '<< @one:pioneer <<', 'map_level_num', 'probe_name'],
      function(
        enabled_loading,
        struc,
        pioneer, num, probe_name) {

        if (!enabled_loading) {
          return
        }

        if (num == -2) {return}

        if (!struc || !pioneer || !probe_name) {return}

        if (!struc.m_children.children) {
          warnStruct()
          return
        }

        const spyglass_view_name = transportName(probe_name)

        if (!struc.m_children.children[spyglass_view_name]) {
          warnStruct()
          return
        }

        const sub_struc = struc.m_children.children[spyglass_view_name].main
        return getUsageStruc(pioneer, 'map_slice', sub_struc, this.app)
      }
    ],

    'to_init': [
      'comp',
      ['mp_dft', 'struc'],
      function(mp_dft, struc) {
        if (!mp_dft || mp_dft > 2 || !struc) {return}
        return struc
      }
    ],

    'to_load': [
      'comp',
      ['mp_dft', 'struc'],
      function(mp_dft, struc) {
        if (!mp_dft || mp_dft > 1 || !struc) {return}
        return struc
      }
    ],

    '__struc_list': [
      'comp',
      ['struc', '<< @one:pioneer'],
      function(struc, pioneer) {
        if (!pioneer || !struc) {return}
        return flatStruc(pioneer, struc)
      }
    ],

    '__supervision': [
      'comp',
      ['_provoda_id'],
      function(_provoda_id) {
        return {
          needy_id: _provoda_id,
          store: {},
          reqs: {},
          is_active: {}
        }
      }
    ],

    '__to_load_all': [
      'comp',
      ['mp_dft', '__struc_list', '__supervision'],
      function(mp_dft, struc, supervision) {
        return {
          inactive: !mp_dft || mp_dft > 1 || !struc,
          list: struc,
          supervision: supervision
        }
      }
    ]
  },
  rels: {
    pioneer: ['input', {any: true}],
    map: ['input', {any: true}], // how to make ref to Router?
    focus_referrer_bwlev: ['input', {any: true}],
  },
  actions: {
    navigateToNavParent: {
      to: ['mp_show'],
      fn: [
        ['$noop', '<<<<'],
        (_data, noop, self) => {
          switchToAliveParent(self)
          return noop
        }
      ]
    },
    'handleAttr:should_be_redirected': {
      to: ['mp_show'],
      fn: [
        ['$noop', '<<<<'],
        (data, noop, self) => {
          if (!data.next_value) {
            return noop
          }

          switchToAliveParent(self)
          return noop
        }
      ],
    },
    'handleAttr:pioneer_removed': {
      to: ['$meta$removed'],
      fn: [
        ['$noop', '<<<<'],
        (data, noop) => {
          if (!data.next_value) {return noop}

          return true
        }
      ]
    }
  },

  getParentMapModel: function() {
    return this.map_parent
  },

  showOnMap: function() {
    // !!!!showMOnMap(BrowseLevel, this.map, this.getNesting('pioneer'), this);
    changeBridge(this)
  },

  requestPage: function(id) {
    return requestPage(BrowseLevel, this, id)
  },

  zoomOut: function() {
    if (this.state('mp_show')) {
      changeBridge(this)
    }
  },

  navCheckGoalToGetBack: function(goal) {
    const selected_goal = goal || pvState(this, 'currentGoal')
    if (!selected_goal) {
      // we have no goal. we are free
      this.navGetBack()
    }

    const goals = pvState(this, 'completedGoals')
    if (!goals || !goals[selected_goal]) {
      // goal is incomplete. cant go
      return
    }

    // go
    this.navGetBack()
  },
  navGetBack: function() {
    const req = pvState(this, 'currentReq')
    if (req && req.current_bwlev_map) {
      const bwlev = getModelById(this, req.current_bwlev_map)
      changeBridge(bwlev)
      return
    }
    const referrer = this.getNesting('focus_referrer_bwlev')
    if (referrer) {
      changeBridge(referrer)
      return
    }

    if (this.map_parent) {
      this.map_parent.showOnMap()
    }


  },
  followTo: function(id) {
    const md = getModelById(this, id)

    // md.requestPage();
    const bwlev = followFromTo(BrowseLevel, this.map, this, md)
    changeBridge(bwlev)
    return bwlev
  },

  'sthc-check_focus_leave': function(target, state, old_state) {
    if (!old_state || state) {
      return
    }

    _updateRel(target, 'focus_referrer_bwlev', null)
  },

  'stch-mpl_attached': function(target, state) {
    const md = target.getNesting('pioneer')
    let obj = pvState(md, 'bmpl_attached')
    obj = obj ? cloneObj({}, obj) : {}
    obj[target._provoda_id] = state
    _updateAttr(md, 'bmpl_attached', obj)
    _updateAttr(md, 'mpl_attached', countKeys(obj, true))
  },

  'stch-to_init': function(target, struc) {
    if (!struc) {return}

    // init nestings

    initNestingsByStruc(target.getNesting('pioneer'), struc)
  },

  'stch-to_load': function(target, struc) {
    if (!struc) {return}

    // load nestings (simple)

    loadNestingsByStruc(target.getNesting('pioneer'), struc)
  },

  'stch-__to_load_all': function(target, obj, prev) {
    if (!obj.list) {
      return
    }

    if (obj.inactive == (prev && prev.inactive)) {
      return
    }

    // load everything

    loadAllByStruc(target.getNesting('pioneer'), obj, prev)
  },
})

function getStrucSources(md, struc) {
  //console.log(struc);
  const result = {}
  for (const space_name in struc) {
    result[space_name] = getModelSources(md.app, md, struc[space_name])
    //var cur = struc[space_name];
  }
  return result
  //console.log(md.model_name, md.constr_id, result);
}
export default BrowseLevel
