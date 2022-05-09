
import spv from '../../spv'
import Model from '../Model'
import changeBridge from './changeBridge'
import requestPage from './requestPage'
import followFromTo from './followFromTo'
import getModelById from '../utils/getModelById'
import _updateRel from '../_internal/_updateRel'
import pvState from '../utils/state'
import flatStruc from '../structure/flatStruc'
import getUsageStruc from '../structure/getUsageStruc'
import initNestingsByStruc from '../structure/reactions/initNestingsByStruc'
import loadNestingsByStruc from '../structure/reactions/loadNestingsByStruc'
// import loadAllByStruc from '../structure/reactions/loadAllByStruc'
import getModelSources from '../structure/getModelSources'
import showMOnMap from './showMOnMap'
import getAliveNavPioneer from './getAliveNavPioneer'
import getBwlevParent from './getBwlevParent'
import { hasRelDcl } from '../dcl/nests/getRelShape'
import { hasOwnProperty } from '../hasOwnProperty'
import isBwlevName from '../utils/isBwlevName'


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

  return showMOnMap(map, alive_pioneer)
}

const switchToAliveParent = (bwlev) => {
  const bwlev_parent = getBwlevParent(bwlev)
  changeBridge(
    selectParentToGo(
      bwlev.map,
      bwlev.getNesting('pioneer'),
      bwlev_parent && bwlev_parent.getNesting('pioneer')) ||
    bwlev_parent ||
    bwlev.map.start_bwlev,
    bwlev.map)
}

const BrowseLevel = spv.inh(Model, {
  naming: function(fn) {
    return function BrowseLevel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },

  postInit: function(self) {

    self.children_bwlevs_by_pioneer_id = {}
    self.map = null

    if (!hasRelDcl(self, 'nav_parent')) {
      throw new Error('bwlev should have nav_parent rel defined')
    }

    // self.model_name = states['model_name'];
    //
    // if (!self.model_name) {
    // 	throw new Error('must have model name');
    // }

  },
  onExtend: function(_self, props) {
    if (!hasOwnProperty(props, 'model_name')) {
      return
    }
    if (!isBwlevName(props.model_name)) {
      console.log(props.model_name)
      throw new Error('should starts with `bwlev:`')
    }
  },
}, {
  model_name: 'bwlev',
  attrs: {
    map_level_num: ['input'],
    is_main_perspectivator_resident: ['input', false],
    probe_name: ['input'],
    pioneer_provoda_id: ['input'],
    pioneer: ['input'],
    currentReq: ['input'],
    distance_from_destination: ['input'],
    mp_show: ['input'],
    mp_has_focus: ['input'],
    freeze_parent_bwlev: ['input'],
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
      ['distance_from_destination', 'struc'],
      function(distance, struc) {
        if (distance == null || distance > 1 || !struc) {return}
        return struc
      }
    ],

    'to_load': [
      'comp',
      ['distance_from_destination', 'struc'],
      function(distance, struc) {
        if (distance == null || distance > 0 || !struc) {return}
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
      ['distance_from_destination', '__struc_list', '__supervision'],
      function(distance, struc, supervision) {
        return {
          inactive: distance == null || distance > 1 || !struc,
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
    parent_bwlev: ['input', {any: true}],
    bwlev_parents_branch: [
      'comp',
      ['<<<<', '<< @all:parent_bwlev.bwlev_parents_branch'],
      (one, list) => ([...list, one].filter(Boolean)),
      {
        many: true,
        any: true,
        // linking: ['<< parent_bwlev', '<< parent_bwlev.bwlev_parents_branch']
      }
    ],
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
    },
    'handleRel:nav_parent': {
      to: {
        map_level_num: ['map_level_num'],
        parent_bwlev: ['<< parent_bwlev', {method: 'set_one'}],
      },
      fn: [
        ['$noop', '<<<<', '$meta$inited', 'freeze_parent_bwlev', '<< @one:parent_bwlev'],
        (data, noop, self, inited, freeze_parent_bwlev, current_parent_bwlev) => {
          if (!inited || freeze_parent_bwlev) {
            return noop
          }

          const deleteCacheValue = (prev, item) => {
            if (!prev) {return}

            const pioneer_id = item.getNesting('pioneer')._provoda_id
            delete prev.children_bwlevs_by_pioneer_id[pioneer_id]
          }

          const setCacheValue = (next, item) => {
            if (!next) {return}

            const pioneer_id = item.getNesting('pioneer')._provoda_id
            next.children_bwlevs_by_pioneer_id[pioneer_id] = item
          }

          deleteCacheValue(current_parent_bwlev, self)

          if (!data.next_value) {
            return {
              map_level_num: -1,
              parent_bwlev: null
            }
          }

          const new_parent_bwlev = showMOnMap(self.map, data.next_value)

          setCacheValue(new_parent_bwlev, self)
          return {
            map_level_num: new_parent_bwlev.getAttr('map_level_num') + 1,
            parent_bwlev: new_parent_bwlev
          }
        }
      ]
    },
  },

  getParentMapModel: function() {
    return getBwlevParent(this)
  },

  showOnMap: function() {
    // !!!!showMOnMap(this.map, this.getNesting('pioneer'), this);
    changeBridge(this)
  },

  requestPage: function(id) {
    return requestPage(this, id)
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

    getBwlevParent(this)?.showOnMap()
  },
  followTo: function(id) {
    const md = getModelById(this, id)

    // md.requestPage();
    const bwlev = followFromTo(this.map, this, md)
    changeBridge(bwlev)
    return bwlev
  },

  'sthc-check_focus_leave': function(target, state, old_state) {
    if (!old_state || state) {
      return
    }

    _updateRel(target, 'focus_referrer_bwlev', null)
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

  'stch-__to_load_all': function(_target, obj, prev) {
    if (!obj.list) {
      return
    }

    if (obj.inactive == (prev && prev.inactive)) {
      return
    }

    // load everything
    throw new Error('deps loading is broken')
    // loadAllByStruc(target.getNesting('pioneer'), obj, prev)
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
