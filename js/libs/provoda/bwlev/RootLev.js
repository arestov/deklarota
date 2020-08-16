
import Model from '../Model'
import spv from 'spv'
import handleSpyglassRequests from '../dcl/spyglass/handleRequest'
import updateSpyglass from '../dcl/spyglass/update'
import _updateAttr from '_updateAttr'
import showMOnMap from './showMOnMap'
import getModelById from '../utils/getModelById'
import followFromTo from './followFromTo'
import getSPByPathTemplate from '__lib/routes/legacy/getSPByPathTemplate'
import cloneObj from 'spv/cloneObj'


var RootLev = spv.inh(Model, {
  init: function(self) {
    self.used_data_structure = null
  }
}, {
  model_name: 'root_bwlev',
  rpc_legacy: {
    requestSpyglass: handleSpyglassRequests,
    requestPage: function(id) {
      var md = getModelById(this, id)
      var bwlev = showMOnMap(this.app.CBWL, getSPByPathTemplate(this.app, this, 'spyglass-navigation'), md)
      bwlev.showOnMap()
    },
    followURL: function(from_id, url) {
      var from_bwlev = getModelById(this, from_id)
      var md = from_bwlev.getNesting('pioneer')

      var target_md = getSPByPathTemplate(this.app, md, url)

      var bwlev = followFromTo(this.app.CBWL, getSPByPathTemplate(this.app, this, 'spyglass-navigation'), from_bwlev, target_md)
      bwlev.showOnMap()
      return bwlev
    },
    followTo: function(from_id, id) {
      var md = getModelById(this, id)
      if (md.getRelativeModel) {
        md = md.getRelativeModel()
      }

      var from_bwlev = getModelById(this, from_id)

      var bwlev = followFromTo(this.app.CBWL, this, getSPByPathTemplate(this.app, this, 'spyglass-navigation'), from_bwlev, md)
      bwlev.showOnMap()
      return bwlev
    },
    knowViewingDataStructure: function(constr_id, used_data_structure) {
      if (this.used_data_structure) {
        return
      }

      this.used_data_structure = used_data_structure
      _updateAttr(this, 'used_data_structure', used_data_structure)
    },
    navShowByReq: function(req, router_name_arg) {
      var router_name = router_name_arg
        ? ('spyglass-' + router_name_arg)
        : 'spyglass-navigation'

      var remember_context = !req || req.remember_context !== false

      var map = getSPByPathTemplate(this.app, this, router_name)

      var current_mp_bwlev = map.getNesting('current_mp_bwlev')

      var current_bwlev_map = req.current_bwlev_map || (remember_context
        ? current_mp_bwlev && current_mp_bwlev._provoda_id
        : null)

      var fullReq = cloneObj(cloneObj({}, req), {
        current_bwlev_map: current_bwlev_map,
      })

      map.input(function() {
        _updateAttr(map, 'wantedReq', fullReq)
      })
    }
  },
  updateSpyglass: function(data) {
    updateSpyglass(this.app.CBWL, this, data)
  },
  toggleSpyglass: function(data) {
    updateSpyglass.toggle(this.app.CWBL, this, data)
  },
  spyglassURL: function(name, pattern, data) {
    // navigation, "/tags/[:tag]" {tag: "tgbbb"}
  },
})

export default RootLev
