define(function (require) {
'use strict';
var spv = require('spv');

var Model = require('../Model');
var changeBridge = require('./changeBridge');
var requestPage = require('./requestPage');
var followFromTo = require('./followFromTo');

var getModelById = require('../utils/getModelById');
var _updateAttr = require('_updateAttr');
var pvState = require('../utils/state');

var flatStruc = require('../structure/flatStruc');
var getUsageStruc = require('../structure/getUsageStruc');
var initNestingsByStruc = require('../structure/reactions/initNestingsByStruc');
var loadNestingsByStruc = require('../structure/reactions/loadNestingsByStruc');
var loadAllByStruc = require('../structure/reactions/loadAllByStruc');
var getModelSources = require('../structure/getModelSources');

var countKeys = spv.countKeys;
var cloneObj = spv.cloneObj;

var transportName = function(spyglass_name) {
  return 'spyglass__' + spyglass_name.replace('/', '__');
}

var warnStruct = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }
  console.warn('add struct')
}

var BrowseLevel = spv.inh(Model, {
  strict: true,
  naming: function(fn) {
    return function BrowseLevel(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states);
    };
  },
  init: function(self, opts, data, params, more, states) {
    self.children_bwlevs = {};
    self.map = null

    // self.model_name = states['model_name'];
    //
    // if (!self.model_name) {
    // 	throw new Error('must have model name');
    // }

    var pioneer = states['pioneer'];

    self.ptree = [self];
    self.rtree = [pioneer];

    if (self.map_parent) {
      self.ptree = self.ptree.concat(self.map_parent.ptree);
      self.rtree = self.rtree.concat(self.map_parent.rtree);
    }
  }
}, {
  model_name: 'bwlev',
  attrs: {
    'check_focus_leave': [
      'compx',
      ['mp_has_focus'],
    ],
    "should_be_redirected": [
      'compx',
      ['< @one:nav_item_removed < pioneer <<', '< @one:_provoda_id < pioneer <<', 'mp_show'],
      function(state, _provoda_id, show) {
        return state && show && _provoda_id
      }
    ],
    "source_of_item": [
      'compx',
      ['<< @one:pioneer <<'],
      function(pioneer) {
        if (!pioneer) {
          return;
        }

        return pioneer._network_source
      }
    ],
    "sources_of_item_details_by_space": [
      "compx",
      ['struc', '<< @one:pioneer <<'],
      function(struc, pioneer) {
        if (!pioneer) {return;}

        return getStrucSources(pioneer, struc)
      }
    ],
    enabled_loading: [
      'compx',
      ['< @one:disable_auto_loading < map <<'],
      function(disabled) {
        return !disabled
      }
    ],

    "struc": [
      "compx",
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

        if (!struc || !pioneer || !probe_name) {return;}

        if (!struc.m_children.children) {
          warnStruct()
          return
        }

        var spyglass_view_name = transportName(probe_name)

        if (!struc.m_children.children[spyglass_view_name]) {
          warnStruct()
          return
        }

        var sub_struc = struc.m_children.children[spyglass_view_name].main;
        return getUsageStruc(pioneer, 'map_slice', sub_struc, this.app);
      }
    ],

    "to_init": [
      "compx",
      ['mp_dft', 'struc'],
      function(mp_dft, struc) {
        if (!mp_dft || mp_dft > 2 || !struc) {return;}
        return struc;
      }
    ],

    "to_load": [
      "compx",
      ['mp_dft', 'struc'],
      function(mp_dft, struc) {
        if (!mp_dft || mp_dft > 1 || !struc) {return;}
        return struc;
      }
    ],

    "__struc_list": [
      "compx",
      ['struc'],
      function(struc) {
        if (!this.getNesting('pioneer') || !struc) {return;}
        return flatStruc(this.getNesting('pioneer'), struc);
      }
    ],

    "__supervision": [
      "compx",
      [],
      function () {
          return {
            needy_id: this._provoda_id,
            store: {},
            reqs: {},
            is_active: {}
          };
        }
    ],

    "__to_load_all": [
      "compx",
      ['mp_dft', '__struc_list', '__supervision'],
      function(mp_dft, struc, supervision) {
        return {
          inactive: !mp_dft || mp_dft > 1 || !struc,
          list: struc,
          supervision: supervision
        };
      }
    ]
  },

  getParentMapModel: function() {
    return this.map_parent;
  },

  showOnMap: function() {
    // !!!!showMOnMap(BrowseLevel, this.map, this.getNesting('pioneer'), this);
    changeBridge(this);
  },

  requestPage: function(id) {
    return requestPage(BrowseLevel, this, id);
  },

  zoomOut: function() {
    if (this.state('mp_show')) {
      changeBridge(this);
    }
  },

  navCheckGoalToGetBack: function(goal) {
    var selected_goal = goal || pvState(this, 'currentGoal');
    if (!selected_goal) {
      // we have no goal. we are free
      this.navGetBack();
    }

    var goals = pvState(this, 'completedGoals');
    if (!goals || !goals[selected_goal]) {
      // goal is incomplete. cant go
      return
    }

    // go
    this.navGetBack();
  },
  navGetBack: function() {
    var req = pvState(this, 'currentReq')
    if (req && req.current_bwlev_map) {
      var bwlev = getModelById(this, req.current_bwlev_map)
      changeBridge(bwlev);
      return
    }
    var referrer = this.getNesting('focus_referrer_bwlev')
    if (referrer) {
      changeBridge(referrer);
      return
    }

    if (this.map_parent) {
      this.map_parent.showOnMap()
    }


  },
  followTo: function(id) {
    var md = getModelById(this, id);
    if (md.getRelativeModel) {
      md = md.getRelativeModel();
    }
    // md.requestPage();
    var bwlev = followFromTo(BrowseLevel, this.map, this, md);
    changeBridge(bwlev);
    return bwlev;
  },

  'sthc-check_focus_leave': function(target, state, old_state) {
    if (!old_state || state) {
      return
    }

    target.updateNesting('focus_referrer_bwlev', null)
  },

  'stch-mpl_attached': function(target, state) {
    var md = target.getNesting('pioneer');
    var obj = pvState(md, 'bmpl_attached');
    obj = obj ? cloneObj({}, obj) : {};
    obj[target._provoda_id] = state;
    _updateAttr(md, 'bmpl_attached', obj);
    _updateAttr(md, 'mpl_attached', countKeys(obj, true));
  },

  'stch-to_init': function(target, struc) {
    if (!struc) {return;}

    // init nestings

    initNestingsByStruc(target.getNesting('pioneer'), struc);
  },

  'stch-to_load': function(target, struc) {
    if (!struc) {return;}

    // load nestings (simple)

    loadNestingsByStruc(target.getNesting('pioneer'), struc);
  },

  'stch-__to_load_all': function(target, obj, prev) {
    if (!obj.list) {
      return;
    }

    if (obj.inactive == (prev && prev.inactive)) {
      return;
    }

    // load everything

    loadAllByStruc(target.getNesting('pioneer'), obj, prev);
  },
  'stch-should_be_redirected': function(self, state) {
    if (!state) {
      return
    }

    changeBridge(self.map_parent || self.map.start_bwlev, self.map)
  }
});

BrowseLevel.prototype.BWL = BrowseLevel;
// kinda hack TODO FIXME

function getStrucSources(md, struc) {
  //console.log(struc);
  var result = {};
  for (var space_name in struc) {
    result[space_name] = getModelSources(md.app, md, struc[space_name]);
    //var cur = struc[space_name];
  }
  return result;
  //console.log(md.model_name, md.constr_id, result);
};



return BrowseLevel;
});
