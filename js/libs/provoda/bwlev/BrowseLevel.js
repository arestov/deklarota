
import Model from '../Model'
import requestPage from './requestPage'
import getModelById from '../utils/getModelById'
import pvState from '../utils/state'
import flatStruc from '../structure/flatStruc'
import getUsageStruc from '../structure/getUsageStruc'
import initNestingsByStruc from '../structure/reactions/initNestingsByStruc'
// import loadAllByStruc from '../structure/reactions/loadAllByStruc'
import getModelSources from '../structure/getModelSources'
import showMOnMap from './showMOnMap'
import getAliveNavPioneer from './getAliveNavPioneer'
import getBwlevParent from './getBwlevParent'
import { hasRelDcl } from '../dcl/nests/getRelShape'
import { hasOwnProperty } from '../hasOwnProperty'
import isBwlevName from '../utils/isBwlevName'
import getRel from '../provoda/getRel'
import getBwlevMap from './getBwlevMap'
import followFromTo from './followFromTo'
import execAction from '../dcl/passes/execAction'
import spvExtend from '../../spv/inh'
import _updateAttr from '../_internal/_updateAttr'


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
  const map = getBwlevMap(bwlev)
  const result_bwlev = selectParentToGo(
    map,
    bwlev.getNesting('pioneer'),
    bwlev_parent && bwlev_parent.getNesting('pioneer')
  ) ||
    bwlev_parent ||
    getRel(map, 'start_bwlev')

  execAction(map, 'showBwlev', result_bwlev)
}

const BrowseLevel = spvExtend(Model, {
  naming: function(fn) {
    return function BrowseLevel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },

  postInit: function(self) {
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
    children_bwlevs_by_pioneer_id: ['input', Object.freeze({})],
    // can we calc this using some rel?

    pioneer_node_id: ['input'],
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
    consider_removed: [
      'comp',
      ['< @one:$meta$removed < pioneer', '< @one:$meta$removed < parent_bwlev'],
      (pioneer, parent) => Boolean(pioneer || parent),
    ],
    'navigation_unavailable': [
      'comp',
      ['< @one:prpt_navigation_available < pioneer', 'consider_removed', '< @one:nav_item_removed < pioneer'],
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
      ['navigation_unavailable', '< @one:_node_id < pioneer <<', 'mp_show'],
      function(state, _node_id, show) {
        return state && show && _node_id
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
      ['_node_id'],
      function(_node_id) {
        return {
          needy_id: _node_id,
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
          list: struc || null,
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

          /* showBwlev will find alive item */
          execAction(getBwlevMap(self), 'showBwlev', self)
          return noop
        }
      ],
    },
    'handleAttr:consider_removed': {
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
          // TODO: make test for this code

          if (!inited || freeze_parent_bwlev) {
            return noop
          }

          const deleteCacheValue = (prev, item) => {
            if (!prev) {return}

            const pioneer_id = item.getNesting('pioneer')._node_id
            const cache = { ...prev.getAttr('children_bwlevs_by_pioneer_id') }
            delete cache[pioneer_id]

            // TODO: let's not change state by calling updateAttr inside action
            _updateAttr(prev, 'children_bwlevs_by_pioneer_id', cache)
          }

          const setCacheValue = (next, item) => {
            if (!next) {return}

            const pioneer_id = item.getNesting('pioneer')._node_id
            const cache = {...next.getAttr('children_bwlevs_by_pioneer_id') }
            cache[pioneer_id] = item._node_id

            // TODO: let's not change state by calling updateAttr inside action
            _updateAttr(next, 'children_bwlevs_by_pioneer_id', cache)
          }

          deleteCacheValue(current_parent_bwlev, self)

          if (!data.next_value) {
            return {
              map_level_num: -1,
              parent_bwlev: null
            }
          }

          const new_parent_bwlev = showMOnMap(getBwlevMap(self), data.next_value)

          setCacheValue(new_parent_bwlev, self)
          return {
            map_level_num: new_parent_bwlev.getAttr('map_level_num') + 1,
            parent_bwlev: new_parent_bwlev
          }
        }
      ]
    },
    'handleAttr:check_focus_leave': {
      to: ['<< focus_referrer_bwlev', {method: 'set_one'}],
      fn: [
        ['$noop'],
        (data, noop) => {
          if (!data.prev_value || data.next_value) {
            return noop
          }

          return null
        }
      ]
    },

    navigateToResourceByStacking: {
      /*
        we have:
          - context bwlev
          - target model (not bwlev)
        result:
          - new bwlev with `context bwlev` as parent bwlev
      */
      to: ['<< map.current_mp_bwlev', { method: 'set_one' }],
      fn: [
        ['$noop', '<<<<', '<< @one:map'],
        (data, noop, self, map) => {
          const md = getModelById(self, data.target_id)
          const parent_bwlev = self
          const bwlev = followFromTo(map, parent_bwlev, md)
          execAction(map, 'showBwlev', bwlev)

          return noop
        },
      ],
    }
  },

  getParentMapModel: function() {
    return getBwlevParent(this)
  },

  showOnMap: function() {
    // !!!!showMOnMap(this.map, this.getNesting('pioneer'), this);
    execAction(getBwlevMap(this), 'showBwlev', this)
  },

  requestPage: function(id) {
    return requestPage(this, id)
  },

  zoomOut: function() {
    if (this.getAttr('mp_show')) {
      execAction(getBwlevMap(this), 'showBwlev', this)
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
    if (req && req.current_bwlev_id) {
      const bwlev = getModelById(this, req.current_bwlev_id)
      bwlev.showOnMap()
      return
    }
    const referrer = this.getNesting('focus_referrer_bwlev')
    if (referrer) {
      referrer.showOnMap()
      return
    }

    getBwlevParent(this)?.showOnMap()
  },


  'stch-to_init': function(target, struc) {
    if (!struc) {return}

    // init nestings

    initNestingsByStruc(target.getNesting('pioneer'), struc)
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
