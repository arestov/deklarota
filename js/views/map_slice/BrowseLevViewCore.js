
import spv from '../../libs/spv'
import View from '../../libs/provoda/View'
import _updateAttr from '../../libs/provoda/_internal/_updateAttr'
import mergeBhv from '../../libs/provoda/provoda/_lmerge'
import used_str from '../utils/used_struc'
import { considerOwnerAsImportantForRequestsManager } from '../../libs/provoda/dcl/effects/legacy/api/requests_manager'
const used_struc_bhv = used_str.bhv

const BrowseLevView = spv.inh(View, {
  init(self) {
    self.updateAttr('$meta$view$nesting_space', self.nesting_space)
  },
}, mergeBhv({
  attrs: {
    'mp_show_end': [
      'comp',
      ['animation_started', 'animation_completed', 'vmp_show'],
      function(animation_started, animation_completed, vmp_show) {
        if (!animation_started) {
          return vmp_show
        } else {
          if (animation_started == animation_completed) {
            return vmp_show
          } else {
            return false
          }
        }
      }
    ],
    'full_focus': [
      'comp',
      ['mp_show', 'mp_has_focus'],
      function(a, b) {
        return a && b
      }
    ],
    'sources_of_item_details': [
      'comp',
      ['sources_of_item_details_by_space', '$meta$view$nesting_space'],
      function(obj, nesting_space) {
        return obj && obj[nesting_space]
      }
    ],
    'map_slice_view_sources':[
      'comp',
      ['source_of_item', 'sources_of_item_details'],
      function(one, all) {
        if (!all) {
          return [one]
        }

        if (!one) {
          return all
        }

        const combined = all.slice()
        combined.unshift(one)

        const byKey = spv.makeIndexByField(combined)
        return Object.keys(byKey)
      }
    ]
  },

  'stch-full_focus': function(target, value) {
    if (!value) {
      return
    }
    considerOwnerAsImportantForRequestsManager(target)
  },

  base_tree: {
    sample_name: 'browse_lev_con'
  },

  'stch-map_slice_view_sources': function(target, state) {
    if (state) {
      if (target.location_name == 'map_slice-detailed') {
        return
      }

      if (target.parent_view.parent_view != target.root_view || target.nesting_name != 'map_slice') {
        return
      }

      _updateAttr(target, 'view_sources', state)
    }
  },

  'collch-$spec_common-pioneer': {
    by_model_name: true,
    place: 'tpl.ancs.con'
  },

  'collch-$spec_det-pioneer': {
    space: 'all-sufficient-details',
    by_model_name: true,
    place: 'tpl.ancs.con'
  },

  'collch-$spec_noplace-pioneer': {
    by_model_name: true
  },

  // 'collch-$spec_wrapped-pioneer': {
  // 	is_wrapper_parent: '^',
  // 	space: 'all-sufficient-details',
  // 	by_model_name: true,
  // 	place: 'tpl.ancs.con'
  // },
  'sel-coll-pioneer//detailed':'$spec_det-pioneer',

  'sel-coll-pioneer/start_page': '$spec_noplace-pioneer',

  'sel-coll-pioneer': '$spec_common-pioneer',
}, used_struc_bhv))

export default BrowseLevView
