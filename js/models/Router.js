
import Model from '../libs/provoda/provoda/model/Model'
import spv, { countKeys } from '../libs/spv'
import pvState from '../libs/provoda/provoda/state'
import _updateRel from '../libs/provoda/_internal/_updateRel'
import getNesting from '../libs/provoda/provoda/getNesting'
import createLevel from '../libs/provoda/bwlev/createLevel'
import showMOnMap from '../libs/provoda/bwlev/showMOnMap'
import getModelById from '../libs/provoda/utils/getModelById'
import _updateAttr from '../libs/provoda/_internal/_updateAttr'
import animateMapChanges from '../libs/provoda/bwlev/animateMapChanges'
import handlers from '../libs/provoda/bwlev/router_handlers'
import handleCurrentExpectedRel from './handleCurrentExpectedRel'
import BrowseLevel from '../libs/provoda/bwlev/BrowseLevel'
import { considerOwnerAsImportantForRequestsManager } from '../libs/provoda/dcl/effects/legacy/api/requests_manager'
import updateNesting from '../libs/provoda/Model/updateNesting'
import changeBridge from '../libs/provoda/bwlev/changeBridge'
import getRel from '../libs/provoda/provoda/getRel'
import execAction from '../libs/provoda/dcl/passes/execAction'

const addRel = (rels, rel_name, Constr) => {
  rels[rel_name] = ['model', Constr]
}

export const BasicRouter = spv.inh(Model, {
  naming: function(fn) {
    return function BasicRouter(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  init: function(self) {
    self.bwlevs = {}

    if (!self.model_name) {
      throw self._throwError('model_name is required for perspectivator')
    }
  },
  onPreExtend(self, props, _original, _params) {

    if (props.sub_page) {
      for (const sub_page_name in props.sub_page) {
        if (!props.sub_page.hasOwnProperty(sub_page_name)) {
          continue
        }
        if (sub_page_name.startsWith('bwlev-')) {
          throw new Error('use bwlevs_for instead of bwlev-')
        }
      }
    }

    const rels = {}

    if (props.model_name) {
      const rel_name = `nav_parent_at_perspectivator_${props.model_name}`

      self.$default_bwlev_constr = spv.inh(BrowseLevel, {}, {
        model_name: `bwlev:$default_for_${props.model_name}`,
        rels: {
          nav_parent: [
            'comp',
            ['< $meta$removed', `<< @one:pioneer.${rel_name}`],
            /* use null when removed to trigger deleteCacheValue */
            (removed, value) => removed ? null : value, { any: true }
          ],
        },
      })

      addRel(rels, 'bwlev-$default', self.$default_bwlev_constr)
    }

    if (props.bwlevs_for) {
      for (const model_name in props.bwlevs_for) {
        if (!props.bwlevs_for.hasOwnProperty(model_name)) {
          continue
        }
        const cur = props.bwlevs_for[model_name]
        if (typeof cur != 'object') {
          throw new Error('bwlevs_for item should object {attrs, rels, ...}')
        }

        addRel(rels, `bwlev-${model_name}`, spv.inh(self.$default_bwlev_constr, {}, cur))
      }
    }

    if (!countKeys(rels, true)) {
      return
    }

    const new_rels = {
      ...props.rels,
      ...rels,
    }

    self.rels = props.rels = new_rels
  }
}, {
  rpc_legacy: {
    ...handlers,
  }
  // 'stch-used_struc': function(self, value) {
  //   console.log('GOT used_struc', value);
  // },
  // '+states': {
  //   struc: [
  //     "compx", ['used_struc', '@current_md', 'name'],
  // 		function(struc, pioneer, probe_name) {
  // 			// if (num == -2) {return}
  // 			if (!struc || !pioneer || !probe_name) {return;}
  // 			return getUsageStruc(pioneer, probe_name, struc, this.app);
  // 		}
  // 	],
  // }
})

export default spv.inh(BasicRouter, {
  naming: function(fn) {
    return function Router(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  init: function(_self) {
  }
}, {
  __use_navi: false,
  attrs: {
    works_without_main_resident: ['input', false],
    selected__name: ['input'],
    current_expected_rel: ['input'],
    perspectivator_name: ['input', 'navigation'],
    __init_router: ['comp', ['_provoda_id'], Boolean],
    'used_data_structure': [
      'comp',
      ['< @one:used_data_structure < $parent'],
    ],
    wantedReq: ['input'],
    currentReqForModel: ['input'],
    resolved_navigation_desire: [
      'comp',
      ['resolved_navigation_desire', 'wantedReq', '< @one:createdByReqIdResources < $root'],
      function(currentValue, req, index) {
        if (!req) {
          return null
        }

        const modelId = req && index && index[req.id]
        if (!modelId) {
          return null
        }

        if (currentValue) { // do not recreate same value
          if (currentValue.id == modelId && currentValue.req == req) {
            return currentValue
          }
        }
        return {
          req: req,
          id: modelId,
        }
      }
    ],
    __access_list: [
      'comp',
      ['< @all:$meta$has_no_access < wanted_bwlev_branch.pioneer', '< @all:_provoda_id < wanted_bwlev_branch'],
      (arg1, arg2) => ([...arg1, ...arg2])
    ],
    current_model_id: [
      'comp',
      ['< @one:_provoda_id < current_mp_md', '$meta$removed'],
      (arg1, removed) => !removed && arg1,
    ],
    current_mp_bwlev: [
      'comp',
      ['<< @one:current_mp_bwlev'],
    ],
  },
  rels: {
    navigation: ['input', {any: true, many: true}],
    start_page: ['input', {any: true}],
    mainLevelResident: ['input', {any: true}],
    mainLevelResidents: ['input', {any: true, many: true}],
    start_bwlev: ['input', {any: true}],

    to_be_shown_model: ['input', {any: true}],

    wanted_bwlev: ['input', {any: true}],
    wanted_bwlev_branch: [
      'comp',
      ['<< @all:wanted_bwlev.bwlev_parents_branch'],
      {any: true, many: true}
    ],
    bwlev_branch_with_access: ['input', {any: true, many: true}],

    /* is_simple_router=true|false */
    bridge_bwlev: ['input', {any: true}],

    current_mp_md: ['input', {any: true}],
    current_mp_bwlev: ['input', {any: true}],

    /* is_simple_router=false */
    map_slice: ['input', {any: true, many: true}],
    selected__bwlev: ['input', {any: true}],
    selected__md: ['input', {any: true}],

    to_be_shown_model_ready: [
      'comp',
      ['< @one:$meta$inited < to_be_shown_model', '<< @one:to_be_shown_model'],
      (ready, model) => ready ? model : null,
      { any: true },
    ],
  },
  actions: {
    'handleAttr:__init_router': {
      to: {
        mainLevelResident: ['<< mainLevelResident', {method: 'set_one'}],
        start_bwlev: ['<< start_bwlev', {method: 'set_one'}],
      },
      fn: [
        ['<<<<', 'perspectivator_name'],
        ({next_value}, self, spyglass_name) => {
          if (!next_value) {
            return {}
          }

          if (self.is_simple_router) {
            return {}
          }

          const mainLevelResident = self.app.start_page

          updateNesting(self, 'mainLevelResident', mainLevelResident)
          updateNesting(self, 'start_bwlev', createLevel(
            spyglass_name,
            -1,
            false,
            mainLevelResident,
            self
          ))

          execAction(self, 'showModel', getRel(self, 'mainLevelResident'))

          return {}
        },
      ]
    },
    'handleAttr:resolved_navigation_desire': {
      to: {
        /* fake targets */
        wantedReq: ['wantedReq'],
        currentReq: ['< currentReq < current_mp_bwlev'], /* kinda */
      },
      fn: [
        ['<<<<'],
        (data, self) => {
          const state = data.next_value

          if (!state) {
            return
          }

          _updateAttr(self, 'wantedReq', null)

          const req = state.req
          const id = state.id
          const md = getModelById(self, id)

          const bwlev = showMOnMap(self, md)
          bwlev.showOnMap()
          _updateAttr(bwlev, 'currentReq', req)
        }
      ]
    },
    'handleAttr:__access_list': {
      to: {
        bwlev_branch_with_access: ['<< bwlev_branch_with_access', { method: 'set_many' }]
      },
      fn: [
        ['<<<<'],
        (_, self) => {
          const target = self
          const map = target

          const list = getNesting(map, 'wanted_bwlev_branch')
          if (!list || !list.length) {
            return {}
          }

          // start_page/level/i===0 can't have `Boolean($meta$has_no_access) === true`. so ok_bwlev = 0
          let ok_bwlev = 0

          for (let i = 0; i < list.length; i++) {
            const cur_bwlev = list[i]
            const md = getNesting(cur_bwlev, 'pioneer')
            const $meta$has_no_access = pvState(md, '$meta$has_no_access')
            if ($meta$has_no_access) {
              break
            }
            ok_bwlev = i
          }
          askAuth(list[ok_bwlev + 1])

          return { bwlev_branch_with_access: list.slice(0, ok_bwlev + 1) }
        },
      ],
    },
    'handleRel:bwlev_branch_with_access': {
      to: {
        'selected__name': ['selected__name']
      },
      fn: [
        ['<<<<'],
        (data, self) => {
          const list = data.next_value
          const bwlev = list && list[list.length - 1]

          const md = bwlev.getNesting('pioneer')

          if (!self.is_simple_router) {
            animateMapChanges(self, data.next_value || [], data.prev_value || [])
          } else {
            _updateRel(self, 'current_mp_md', md)
            _updateRel(self, 'current_mp_bwlev', bwlev)

          }

          _updateRel(self, 'selected__bwlev', bwlev)
          _updateRel(self, 'selected__md', md)
          _updateAttr(self, 'selected__name', md.model_name)

          return {}
        },
      ],
    },
    expectRelBeRevealedByRelPath: {
      to: ['current_expected_rel'],
      fn: [
        ['$now', '_provoda_id'],
        ({rel_path, current_md_id, currentReq}, now, self_id) => {
          return {
            id: `${now}-${self_id}`,
            expected_at: now, // some kind of uniqness for this entry
            rel_path,
            router_id: self_id,
            currentReq,

            // model from data will be used as "base" to start rel_path requesting
            current_md_id,
          }
        },
      ],
    },
    'handleAttr:current_expected_rel': {
      to: {
        nothing: ['current_expected_rel']
      },
      fn: [
        ['<<<<'],
        (data, self) => {

          handleCurrentExpectedRel(self, data)
          return {}
        }
      ],
    },
    'handleAttr:current_model_id': {
      to: {
        expected_rel_data: ['current_expected_rel'],
      },
      fn: [
        ['$noop', 'current_expected_rel'],
        (data, noop, current_expected_rel) => {
          if (!current_expected_rel) {return noop}

          if (current_expected_rel.current_md_id != data.next_value) {return noop}

          return {
            /* erase current_expected_rel since router got expected current_md_id */
            expected_rel_data: null,
          }
        }
      ]
    },
    eraseModel: {
      to: {
        bridge_bwlev: ['<< bridge_bwlev', {method: 'set_one'}],
        current_mp_bwlev: ['<< current_mp_bwlev', {method: 'set_one'}],
        current_mp_md: ['<< current_mp_md', {method: 'set_one'}]
      },
      fn: () => ({
        bridge_bwlev: null,
        current_mp_bwlev: null,
        current_mp_md: null,
      }),
    },
    showModel: {
      to: {
        currentReqForModel: ['currentReqForModel'],
        nextModel: ['<< to_be_shown_model', { method: 'set_one' }],
        eraseModel: ['<<<<', {action: 'eraseModel'}]
      },
      fn: (model) => {
        if (model) {
          if (!Array.isArray(model)) {
            return {currentReqForModel: null, nextModel: model}
          }

          const [nextModel, currentReqForModel] = model
          return {
            currentReqForModel,
            nextModel,
          }

        }

        return {eraseModel: true}
      }
    },
    'handleRel:to_be_shown_model_ready': {
      to: ['<<<<', {action: 'showBwlev'}],
      fn: [
        ['$noop', '<<<<', 'currentReqForModel'],
        (data, noop, self, currentReqForModel) => {
          const md = data.next_value
          if (!md) {
            return noop
          }

          const bwlev = showMOnMap(self, md)
          const payload = currentReqForModel ? [bwlev,currentReqForModel] : bwlev
          return payload
        }
      ]
    },
    showBwlev: {
      to: {
        currentReqForModel: ['currentReqForModel'],
        to_be_shown_model: ['<< to_be_shown_model', { method: 'set_one' }],
        current_bwlev: ['<< current_mp_bwlev', { method: 'set_one' }], // noop. check changeBridge
      },
      fn: [
        ['$noop', '<<<<'],
        (bwlev, noop, self) => {
          if (!Array.isArray(bwlev)) {
            changeBridge(bwlev, self)
          } else {
            const [bwlevm, currentReq] = bwlev
            changeBridge(bwlevm, self)
            _updateAttr(bwlevm, 'currentReq', currentReq)
          }
          return {
            currentReqForModel: null, /* erase */
            to_be_shown_model: null, /* erase */
            current_bwlev: noop
          }
        }
      ]
    },
  },
  effects: {
  },
  'stch-current_mp_bwlev': function(self, bwlev) {
    if (!bwlev) {
      return
    }

    if (self.onCurrentChange) {
      self.onCurrentChange(self, bwlev)
    }

    const important_model = getNesting(bwlev, 'pioneer')
    considerOwnerAsImportantForRequestsManager(important_model)
  },
})

function askAuth(bwlev) {
  if (!bwlev) {return}

  throw new Error('focus to model with auth')
}
