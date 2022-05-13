
import BrowseMap from './BrowseMap'
import _updateRel from '../_internal/_updateRel'

import spv from '../../spv'
import makeItemByData from '../Model/makeItemByData'
import getRelUniq from '../dcl/nests/uniq/getRelUniq'
import { addUniqItem, findDataDup, MutUniqState } from '../dcl/nests/uniq/MutUniqState'

export const handleNetworkSideData = function(target, source_name, ns, data) {
  target.app.handleNetworkSideData(source_name, ns, data, target)
}

const LoadableListBase = spv.inh(BrowseMap.Model, {
  strict: true,
  naming: function(fn) {
    return function LoadableListBase(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  init: function initLoadableListBase(self) {
    self.loaded_nestings_items = null
  },
}, {
  handling_v2_init: true,
  attrs: {

    // TODO: find way to get rid of it
    has_data_loader: ['input', null],
    main_list_loading: ['input', false],
    all_data_loaded: ['input', false],

    'can_load_data': [
      'comp',
      ['has_data_loader', 'loader_disallowed', 'has_no_access'],
      function(has_data_loader, loader_disallowed, has_no_access) {
        return has_data_loader && !loader_disallowed && !has_no_access
      }
    ],

  },

  main_list_name: 'lists_list',

  getLength: function(nesting_name) {
    if (!nesting_name) {
      throw new Error('provide nesting_name')
    }
    return (this.loaded_nestings_items && this.loaded_nestings_items[ nesting_name ]) || 0
  },

  requestMoreData: function(nesting_name) {
    if (!nesting_name) {
      throw new Error('rel name should be provided')
    }

    if (this._nest_reqs && this._nest_reqs[nesting_name]) {
      this.requestNesting(this._nest_reqs[nesting_name], nesting_name)
    }
  },

  insertDataAsSubitems: function(target, nesting_name, data_list, source_name) {
    const splitItemData = target['nest_rq_split-' + nesting_name]
    if (splitItemData) {
      throw new Error('nest_rq_split derecated')
    }

    const cur_val = target.getNesting(nesting_name)
    const uniq = getRelUniq(target, nesting_name)
    const mut_uniq_state = uniq && new MutUniqState(uniq, cur_val)
    const list = cur_val ? [...cur_val] : []

    for (let i = 0; i < data_list.length; i++) {
      const cur_data = data_list[i]

      if (target.isDataItemValid && !target.isDataItemValid(cur_data)) {
        continue
      }

      const dup = findDataDup(mut_uniq_state, cur_data)
      if (dup) {
        dup.updateManyStates(cur_data)
      }

      const item = dup || makeItemByData(target, nesting_name, cur_data)
      if (!dup && mut_uniq_state) {
        addUniqItem(mut_uniq_state, item)
      }
      list.push(item)


      if (source_name && item && item._network_source === null) {
        item._network_source = source_name
      }
    }

    _updateRel(this, nesting_name, list)
  },
  __getLoadableRel: function() {
    let rel_name
    for (rel_name in this._nest_reqs) {
      if (!this._nest_reqs.hasOwnProperty(rel_name)) {
        rel_name = null
        continue
      }

      break
    }
    return rel_name
  },

  compareItemWithObj: function(item, data) {
    if (!this.items_comparing_props) {
      return
    }
    for (let i = 0; i < this.items_comparing_props.length; i++) {
      const cur = this.items_comparing_props[i]
      const item_value = spv.getTargetField(item, cur[0])
      const data_value = spv.getTargetField(data, cur[1])
      if (item_value !== data_value) {
        return false
      }
    }
    return true
  },

  compareItemsWithObj: function(array, omo, soft) {
    for (let i = 0; i < array.length; i++) {
      if (this.compareItemWithObj(array[i], omo, soft)) {
        return array[i]
      }
    }
  },
  getMainlist: function() {
    throw new Error('getMainlist is depricated')
  },
})

LoadableListBase.LoadableListBase = LoadableListBase

export default LoadableListBase
