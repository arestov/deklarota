
import Model from '../Model'
import handleSpyglassRequests from '../dcl/spyglass/handleRequest'
import updateSpyglass from '../dcl/spyglass/update'
import _updateAttr from '../_internal/_updateAttr'
import showMOnMap from './showMOnMap'
import getModelById from '../utils/getModelById'
import cloneObj from '../../spv/cloneObj'
import handlers from './router_handlers'
import requireRouter from './requireRouter'
import spvExtend from '../../spv/inh'

const SessionRoot = spvExtend(Model, {
  /*
    root lev manages routers

    > SessionRoot
      > Routers by name
      > Routers by complex name (key)
  */
}, {
  model_name: 'root_bwlev',
  attrs: {
    used_data_structure: ['input'],
    spyglasses_index: ['input'],
    spyglasses_requests: ['input'],
    probe_name: ['input'],
    map_level_num: ['input'],
    is_main_perspectivator_resident: ['input'],
    pioneer_node_id: ['input'],
    pioneer: ['input'],
    freeze_parent_bwlev: ['input'],
  },
  rels: {
    pioneer: ['input', {linking: '<<<< #'}],
    spyglasses: ['input', {any: true, many: true}],
  },
  rpc_legacy: {
    ...handlers,
    requestSpyglass: handleSpyglassRequests,
    requestPage: function(id) {
      const md = getModelById(this, id)
      const bwlev = showMOnMap(requireRouter('navigation'), md)
      bwlev.showOnMap()
    },
    knowViewingDataStructure: function(_constr_id, used_data_structure) {
      if (this.getAttr('used_data_structure')) {
        return
      }

      _updateAttr(this, 'used_data_structure', used_data_structure)
    },
    navShowByReq: function(req, router_name_arg) {
      // TODO: move to router_handlers

      const remember_context = !req || req.remember_context !== false

      const map = requireRouter(
        this,
        router_name_arg
          ? router_name_arg
          : 'navigation'
      )

      const current_mp_bwlev = map.getNesting('current_mp_bwlev')

      const current_bwlev_id = req.current_bwlev_id || (remember_context
        ? current_mp_bwlev && current_mp_bwlev._node_id
        : null)

      const fullReq = cloneObj(cloneObj({}, req), {
        current_bwlev_id: current_bwlev_id,
      })

      map.input(function() {
        _updateAttr(map, 'wantedReq', fullReq)
      })
    }
  },
  updateSpyglass: function(data) {
    updateSpyglass(this, data)
  },
  toggleSpyglass: function(data) {
    updateSpyglass.toggle(this, data)
  },
  spyglassURL: function(_name, _pattern, _data) {
    // navigation, "/tags/[:tag]" {tag: "tgbbb"}
  },
})

export default SessionRoot
