
import Model from '../libs/provoda/provoda/model/Model'
import spv from '../libs/spv'
import pvState from '../libs/provoda/provoda/state'
import _updateRel from '../libs/provoda/_internal/_updateRel'
import joinNavURL from '../libs/provoda/provoda/joinNavURL'
import navi from '../libs/navi'
import changeBridge from '../libs/provoda/bwlev/changeBridge'
import getNesting from '../libs/provoda/provoda/getNesting'
import createLevel from '../libs/provoda/bwlev/createLevel'
import showMOnMap from '../libs/provoda/bwlev/showMOnMap'
import getModelById from '../libs/provoda/utils/getModelById'
import _updateAttr from '../libs/provoda/_internal/_updateAttr'
import BrowseMap from '../libs/BrowseMap'
import animateMapChanges from '../libs/provoda/bwlev/animateMapChanges'
import handlers from '../libs/provoda/bwlev/router_handlers'
import handleCurrentExpectedRel from './handleCurrentExpectedRel'

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
  init: function(self) {
    self.mainLevelResidents = null // BrowseLevel, showMOnMap
    self.bridge_bwlev = null
    self.mainLevelResidents = null
    self.current_mp_bwlev = null

    // target.navigation = [];
    // target.map = ;
    self.current_mp_md = null

    if (self.is_simple_router) {
      return
    }

    const spyglass_name = 'navigation'

    self.mainLevelResident = self.app.start_page
    self.start_bwlev = createLevel(
      self.app.CBWL,
      spyglass_name,
      -1,
      false,
      self.mainLevelResident,
      self
    )

    initMapTree(self, self.app.start_page, self.needs_url_history, navi)
    self.nextTick(function() {
      initNav(self, navi, self.app)
    })
  }
}, {
  __use_navi: false,
  attrs: {
    works_without_main_resident: ['input', false],
    selected__name: ['input'],
    current_expected_rel: ['input'],
    'used_data_structure': [
      'comp',
      ['< used_data_structure <<< ^'],
    ],
    'full_url': [
      'comp',
      ['< @all:url_part < navigation.pioneer <<', '<< @all:navigation <<'],
      function(_updates, list) {
        return list && joinNavURL(list)
      }
    ],
    'doc_title': [
      'comp',
      ['< @all:nav_title < navigation.pioneer <<'],
      function(list) {
        if (!list) {
          return 'Seesu'
        }
        const as_first = list[list.length - 1]
        const as_second = list[list.length - 2]
        if (!as_second) {
          return as_first
        }
        return as_first + ' ← ' + as_second
      }
    ],
    resolved_navigation_desire: [
      'comp',
      ['resolved_navigation_desire', 'wantedReq', '< createdByReqIdResources <<< #'],
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
      ['< @all:has_no_access < wanted_bwlev_branch.pioneer', '< @all:_provoda_id < wanted_bwlev_branch'],
      (arg1, arg2) => ([...arg1, ...arg2])
    ],
    current_model_id: [
      'comp',
      ['< @one:_provoda_id < current_md', '< @one:_provoda_id < current_mp_md'],
      (arg1, arg2) => arg1 || arg2,
    ]
  },
  sub_page: {
    'bwlev-$default': {
      constr: BrowseLevel,
      title: [[]],
    },
  },
  rels: {
    navigation: ['input', {any: true, many: true}],
    start_page: ['input', {any: true}],

    wanted_bwlev: ['input', {any: true}],
    wanted_bwlev_branch: [
      'comp',
      ['<< @all:wanted_bwlev.bwlev_parents_branch'],
      {any: true, many: true}
    ],
    bwlev_branch_with_access: ['input', {any: true, many: true}],

    /* is_simple_router=true: current_bwlev, current_md */
    current_md: ['input', {any: true}],
    current_bwlev: ['input', {any: true}],

    /* is_simple_router=false: current_mp_bwlev, current_mp_md  */
    current_mp_md: ['input', {any: true}],
    current_mp_bwlev: ['input', {any: true}],
    map_slice: ['input', {any: true, many: true}],
    selected__bwlev: ['input', {any: true}],
    selected__md: ['input', {any: true}],

  },
  actions: {
    'handleAttr:resolved_navigation_desire': {
      to: {
        wantedReq: ['wantedReq'],
        currentReq: ['currentReq'],
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

          const bwlev = showMOnMap(self.app.CBWL, self, md)
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

          // start_page/level/i===0 can't have `Boolean(has_no_access) === true`. so ok_bwlev = 0
          let ok_bwlev = 0

          for (let i = 0; i < list.length; i++) {
            const cur_bwlev = list[i]
            const md = getNesting(cur_bwlev, 'pioneer')
            const has_no_access = pvState(md, 'has_no_access')
            if (has_no_access) {
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
          animateMapChanges(self, data.next_value || [], data.prev_value || [])

          const list = data.next_value
          const bwlev = list && list[list.length - 1]

          const md = bwlev.getNesting('pioneer')

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
        ({rel_path, current_md_id}, now, self_id) => {
          return {
            expected_at: now, // some kind of uniqness for this entry
            rel_path,
            router_id: self_id,

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
      to: ['current_expected_rel'],
      fn: [
        ['noop', 'current_expected_rel'],
        (data, noop, current_expected_rel) => {
          if (!current_expected_rel) {return noop}

          if (current_expected_rel.current_md_id != data.next_value) {return noop}

          // erase current_expected_rel since router got expected current_md_id
          return null
        }
      ]
    },

  },
  effects: {
    out: {
      'browser-location': {
        api: ['navi', 'self'],
        trigger: 'full_url',

        fn: function(navi, self, url) {
          if (url == null) {
            return
          }
          const bwlev = self.getNesting('current_mp_bwlev')
          navi.update(url, bwlev)
          self.app.trackPage(bwlev.getNesting('pioneer').model_name)
        },

        require: 'doc_title'
      }
    }
  },
  'stch-@current_mp_bwlev': function(self, _, __, c) {
    const bwlev = c && c.items
    if (!bwlev) {
      return
    }

    if (self.onCurrentChange) {
      self.onCurrentChange(self, bwlev)
    }

    self.app.important_model = getNesting(bwlev, 'pioneer')
    self.app.resortQueue()
  },
})


function initMapTree(target, start_page, needs_url_history, navi) {
  if (target.__use_navi && navi) {
    target.useInterface('navi', needs_url_history && navi)
  }
  _updateRel(target, 'navigation', [])
  _updateRel(target, 'start_page', start_page)

}

function initNav(map, navi, app) {
  if (map.needs_url_history) {
    navi.init(app.inputFn(function(e) {
      const url = e.newURL
      const state_from_history = navi.findHistory(e.newURL)
      const handleQuery = map.handleQuery
      if (state_from_history) {
        changeBridge(state_from_history.data)
        handleQuery(map, state_from_history.data.getNesting('pioneer'))
      } else{
        const interest = BrowseMap.getUserInterest(url.replace(/\ ?\$...$/, ''), app.start_page)
        const bwlev = BrowseMap.showInterest(map, interest)
        BrowseMap.changeBridge(bwlev)
        handleQuery(map, bwlev.getNesting('pioneer'))
      }
    }));
    (function() {
      const url = window.location && window.location.hash.replace(/^\#/,'')
      if (url) {
        app.on('handle-location', function() {
          navi.hashchangeHandler({
            newURL: url
          }, true)

        })
      } else {
        const bwlev = BrowseMap.showInterest(map, [])
        BrowseMap.changeBridge(bwlev)
      }
    })()
  } else {
    const bwlev = BrowseMap.showInterest(map, [])
    BrowseMap.changeBridge(bwlev)
  }
}

function askAuth(bwlev) {
  if (!bwlev) {return}

  getNesting(bwlev, 'pioneer').switchPmd()
}
