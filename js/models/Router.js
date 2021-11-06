
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
import animateMapChanges from '../libs/provoda/dcl/probe/animateMapChanges'
import handlers from '../libs/provoda/bwlev/router_handlers'

export const BasicRouter = spv.inh(Model, {
  naming: function (fn) {
		return function BasicRouter (opts, data, params, more, states) {
			fn(this, opts, data, params, more, states)
		}
	},
  init: function (self) {
    self.bwlevs = {}
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
  naming: function (fn) {
    return function Router (opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  init: function (self) {
    self.mainLevelResidents = null // BrowseLevel, showMOnMap
    self.bridge_bwlev = null
    self.mainLevelResidents = null
    self.current_mp_bwlev = null

    self.binded_models = {}
    // target.navigation = [];
    // target.map = ;
    self.current_mp_md = null

    if (self.is_simple_router) {
      return
    }

    var spyglass_name = 'navigation'

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
    selected__name: ['input'],
    'used_data_structure': [
      'comp',
      ['< used_data_structure <<< ^'],
    ],
    'full_url': [
      'comp',
      ['< @all:url_part < navigation.pioneer <<', '<< @all:navigation <<'],
      function(nil, list) {
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
        var as_first = list[list.length - 1]
        var as_second = list[list.length - 2]
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

        var modelId = req && index && index[req.id]
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
  },
  rels: {
    navigation: ['input', {any: true, many: true}],
    start_page: ['input', {any: true}],
    wanted_bwlev_chain: ['input', {any: true, many: true}],
    current_mp_md: ['input', {any: true}],
    current_mp_bwlev: ['input', {any: true}],
    map_slice: ['input', {any: true}], // many { each_items: all_items,} ???
    selected__bwlev: ['input', {any: true}],
    selected__md: ['input', {any: true}],

  },
  'stch-resolved_navigation_desire': function(self, state) {
    if (!state) {
      return
    }

    _updateAttr(self, 'wantedReq', null)

    var req = state.req
    var id = state.id
    var md = getModelById(self, id)

    var bwlev = showMOnMap(self.app.CBWL, self, md)
    bwlev.showOnMap()
    _updateAttr(bwlev, 'currentReq', req)
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
          var bwlev = self.getNesting('current_mp_bwlev')
          navi.update(url, bwlev)
          self.app.trackPage(bwlev.getNesting('pioneer').model_name)
        },

        require: 'doc_title'
      }
    }
  },
  'stch-@current_mp_bwlev': function(self, _, __, c) {
    var bwlev = c && c.items
    if (!bwlev) {
      return
    }

    if (self.onCurrentChange) {
      self.onCurrentChange(self, bwlev)
    }

    self.app.important_model = getNesting(bwlev, 'pioneer')
    self.app.resortQueue()
  },
  'stch-has_no_access@wanted_bwlev_chain.pioneer': function(target, state, old_state, source) {
    var map = target

    var list = getNesting(map, 'wanted_bwlev_chain')
    if (!list) {
      return
    }

    // start_page/level/i===0 can't have `Boolean(has_no_access) === true`. so ok_bwlev = 0
    var ok_bwlev = 0

    for (var i = 0; i < list.length; i++) {
      var cur_bwlev = list[i]
      var md = getNesting(cur_bwlev, 'pioneer')
      var has_no_access = pvState(md, 'has_no_access')
      if (has_no_access) {
        break
      }
      ok_bwlev = i
    }

    var bwlev = list[ok_bwlev]

    animateMapChanges(target, bwlev)

    _updateRel(map, 'selected__bwlev', bwlev)
    _updateRel(map, 'selected__md', bwlev.getNesting('pioneer'))
    _updateAttr(map, 'selected__name', bwlev.model_name)

    askAuth(list[ok_bwlev + 1])
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
      var url = e.newURL
      var state_from_history = navi.findHistory(e.newURL)
      var handleQuery = map.handleQuery
      if (state_from_history) {
        changeBridge(state_from_history.data)
        handleQuery(map, state_from_history.data.getNesting('pioneer'))
      } else{
        var interest = BrowseMap.getUserInterest(url.replace(/\ ?\$...$/, ''), app.start_page)
        var bwlev = BrowseMap.showInterest(map, interest)
        BrowseMap.changeBridge(bwlev)
        handleQuery(map, bwlev.getNesting('pioneer'))
      }
    }));
    (function() {
      var url = window.location && window.location.hash.replace(/^\#/,'')
      if (url) {
        app.on('handle-location', function() {
          navi.hashchangeHandler({
            newURL: url
          }, true)

        })
      } else {
        var bwlev = BrowseMap.showInterest(map, [])
        BrowseMap.changeBridge(bwlev)
      }
    })()
  } else {
    var bwlev = BrowseMap.showInterest(map, [])
    BrowseMap.changeBridge(bwlev)
  }
}

function askAuth(bwlev) {
  if (!bwlev) {return}

  getNesting(bwlev, 'pioneer').switchPmd()
}
