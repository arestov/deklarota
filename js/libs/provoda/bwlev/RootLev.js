
import Model from '../Model'
import spv from '../../spv'
import handleSpyglassRequests from '../dcl/spyglass/handleRequest'
import updateSpyglass from '../dcl/spyglass/update'
import _updateAttr from '../_internal/_updateAttr'
import showMOnMap from './showMOnMap'
import getModelById from '../utils/getModelById'
import followFromTo from './followFromTo'
import getSPByPathTemplate from '../routes/legacy/getSPByPathTemplate'
import cloneObj from '../../spv/cloneObj'
import handlers from './router_handlers'

var RootLev = spv.inh(Model, {
  /*
    root lev manages routers

    > SessionRoot (RootLev)
      > Routers by name
      > Routers by complex name (key)
  */
  init: function(self) {
    self.used_data_structure = null
  }
}, {
  model_name: 'root_bwlev',
  attrs: {
    used_data_structure: ['input'],
    spyglasses_index: ['input'],
    spyglasses_requests: ['input'],
    probe_name: ['input'],
    map_level_num: ['input'],
    is_main_perspectivator_resident: ['input'],
    pioneer_provoda_id: ['input'],
    pioneer: ['input'],
  },
  rels: {
    pioneer: ['input', {linking: '<<<< #'}],
    spyglasses: ['input', {any: true, many: true}],
  },
  rpc_legacy: {
    ...handlers,
    requestSpyglass: handleSpyglassRequests,
    requestPage: function(id) {
      var md = getModelById(this, id)
      var bwlev = showMOnMap(this.app.CBWL, getSPByPathTemplate(this.app, this, 'router-navigation'), md)
      bwlev.showOnMap()
    },
    followURL: function(from_id, url) {
      var from_bwlev = getModelById(this, from_id)
      var md = from_bwlev.getNesting('pioneer')

      var target_md = getSPByPathTemplate(this.app, md, url)

      var bwlev = followFromTo(this.app.CBWL, getSPByPathTemplate(this.app, this, 'router-navigation'), from_bwlev, target_md)
      bwlev.showOnMap()
      return bwlev
    },
    followTo: function(from_id, id) {
      var md = getModelById(this, id)

      var from_bwlev = getModelById(this, from_id)

      var bwlev = followFromTo(this.app.CBWL, this, getSPByPathTemplate(this.app, this, 'router-navigation'), from_bwlev, md)
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
      // TODO: move to router_handlers
      var router_name = router_name_arg
        ? ('router-' + router_name_arg)
        : 'router-navigation'

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
    updateSpyglass.toggle(this.app.CBWL, this, data)
  },
  spyglassURL: function(name, pattern, data) {
    // navigation, "/tags/[:tag]" {tag: "tgbbb"}
  },
})

export default RootLev
