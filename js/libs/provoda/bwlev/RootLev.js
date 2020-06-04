define(function(require) {
'use strict';
var Model = require('../Model');
var spv = require('spv');
var getUsageStruc = require('../structure/getUsageStruc');
var BrowseLevel = require('./BrowseLevel');
var handleSpyglassRequests = require('../dcl/spyglass/handleRequest')
var updateSpyglass = require('../dcl/spyglass/update');
var getNesting = require('pv/getNesting');
var requestPage = require('./requestPage');
var pvState = require('pv/state');
var pvUpdate = require('pv/update');
var showMOnMap = require('./showMOnMap');
var getModelById = require('../utils/getModelById');
var followFromTo = require('./followFromTo');
var initDeclaredNestings = require('../initDeclaredNestings')
var getSPByPathTemplate = initDeclaredNestings.getSPByPathTemplate;

var cloneObj = require('spv/cloneObj');


var RootLev = spv.inh(Model, {}, {
  model_name: 'root_bwlev',
  BWL: BrowseLevel,
  rpc_legacy: {
    requestSpyglass: handleSpyglassRequests,
    requestPage: function(id) {
      var md = getModelById(this, id);
      var bwlev = showMOnMap(BrowseLevel, getSPByPathTemplate(this.app, this, 'spyglass-navigation'), md)
      bwlev.showOnMap();
    },
    followURL: function(from_id, url) {
      var from_bwlev = getModelById(this, from_id);
      var md = from_bwlev.getNesting('pioneer');

      var target_md = getSPByPathTemplate(this.app, md, url);

      var bwlev = followFromTo(BrowseLevel, getSPByPathTemplate(this.app, this, 'spyglass-navigation'), from_bwlev, target_md);
      bwlev.showOnMap();
      return bwlev;
    },
    followTo: function(from_id, id) {
      var md = getModelById(this, id);
      if (md.getRelativeModel) {
        md = md.getRelativeModel();
      }

      var from_bwlev = getModelById(this, from_id);

      var bwlev = followFromTo(BrowseLevel, this, getSPByPathTemplate(this.app, this, 'spyglass-navigation'), from_bwlev, md);
      bwlev.showOnMap();
      return bwlev;
    },
    knowViewingDataStructure: function(constr_id, used_data_structure) {
      if (this.used_data_structure) {
        return;
      }

      this.used_data_structure = used_data_structure;
      pvUpdate(this, 'used_data_structure', used_data_structure);
    },
    navShowByReq: function(req, router_name_arg) {
      var router_name = router_name_arg
        ? ('spyglass-' + router_name_arg)
        : 'spyglass-navigation'

      var remember_context = !req || req.remember_context === true

      var map = getSPByPathTemplate(this.app, this, router_name)

      var current_mp_bwlev = map.getNesting('current_mp_bwlev')

      var current_bwlev_map = req.current_bwlev_map || (remember_context
        ? current_mp_bwlev && current_mp_bwlev._provoda_id
        : null)

      var fullReq = cloneObj({
        current_bwlev_map,
      }, req)

      map.input(function() {
        map.updateState('wantedReq', fullReq)
      })
    }
  },
  updateSpyglass: function(data) {
    updateSpyglass(BrowseLevel, this, data);
  },
  toggleSpyglass: function(data) {
    updateSpyglass.toggle(BrowseLevel, this, data);
  },
  spyglassURL: function(name, pattern, data) {
    // navigation, "/tags/[:tag]" {tag: "tgbbb"}
  },
})

return RootLev;
});
