
import BrowseMap from './BrowseMap'
import _updateRel from '../_internal/_updateRel'

import spv from '../../spv'
import makeItemByData from '../Model/makeItemByData'

const getRelativeRequestsGroups = BrowseMap.Model.prototype.getRelativeRequestsGroups

const LoadableListBase = spv.inh(BrowseMap.Model, {
  strict: true,
  naming: function(fn) {
    return function LoadableListBase(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  init: function initLoadableListBase(self) {
    self.loaded_nestings_items = null
    self.loadable_lists = null
  },
}, {
  handling_v2_init: true,
  attrs: {

    // TODO: find way to get rid of it
    has_data_loader: ['input', null],
    main_list_loading: ['input', false],
    all_data_loaded: ['input', false],

    '$needs_load': [
      'comp',
      ['more_load_available', 'mp_has_focus'],
      function(can_more, focus) {
        return Boolean(focus && can_more)
      }
    ],

    'list_loading': [
      'comp',
      ['main_list_loading', 'preview_loading', 'id_searching'],
      function(main_list_loading, prevw_loading, id_searching) {
        return main_list_loading || prevw_loading || id_searching
      }
    ],

    'can_load_data': [
      'comp',
      ['has_data_loader', 'loader_disallowed', 'has_no_access'],
      function(has_data_loader, loader_disallowed, has_no_access) {
        return has_data_loader && !loader_disallowed && !has_no_access
      }
    ],

    'can_load_more': [
      'comp',
      ['can_load_data', 'all_data_loaded'],
      function(can_load_data, all_data_loaded) {
        return can_load_data && !all_data_loaded
      }
    ],

    'more_load_available': [
      'comp',
      ['can_load_more', 'list_loading'],
      function(can_load_more, list_loading) {
        return can_load_more && !list_loading
      }
    ]
  },

  'stch-$needs_load': function(target, state) {
    if (state) {
      target.preloadStart()
    }
  },

  handleNetworkSideData: function(target, source_name, ns, data) {
    target.app.handleNetworkSideData(source_name, ns, data, target)
  },

  main_list_name: 'lists_list',
  page_limit: 30,

  getPagingInfo: function(nesting_name, limit) {
    const page_limit = limit || this.page_limit || this.map_parent.page_limit
    const length = this.getLength(nesting_name)
    const has_pages = Math.floor(length / page_limit)
    const remainder = length % page_limit
    const next_page = has_pages + 1

    return {
      current_length: length,
      has_pages: has_pages,
      page_limit: page_limit,
      remainder: remainder,
      next_page: next_page
    }
  },

  preloadStart: function() {
    this.loadStart(this.__getLoadableRel())
  },

  getLength: function(nesting_name) {
    if (!nesting_name) {
      throw new Error('provide nesting_name')
    }
    return (this.loaded_nestings_items && this.loaded_nestings_items[ nesting_name ]) || 0
  },

  loadStart: function(nesting_name) {
    if (!nesting_name) {
      throw new Error('rel name should be provided')
    }

    if (this.state('more_load_available') && !this.getLength(nesting_name)) {
      this.requestMoreData()
    }
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
    const items_list = []

    if (!data_list || !data_list.length) {
      return items_list
    }


    const splitItemData = target['nest_rq_split-' + nesting_name]
    if (splitItemData) {
      throw new Error('nest_rq_split derecated')
    }

    for (let i = 0; i < data_list.length; i++) {
      const cur_data = data_list[i]

      if (target.isDataItemValid && !target.isDataItemValid(cur_data)) {
        continue
      }
      const item = target.addDataItem(cur_data, true, nesting_name)
      if (source_name && item && item._network_source === null) {
        item._network_source = source_name
      }
      items_list.push(item)
    }

    target.dataListChange(items_list, nesting_name)
    return items_list
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
  getRelativeRequestsGroups: function(space) {
    const rel_name = this.__getLoadableRel()
    if (!rel_name) {
      return
    }

    let main_models = this.getNesting(rel_name)
    if (!main_models || !main_models.length) {
      return
    } else {
      main_models = main_models.slice()
      const more_models = getRelativeRequestsGroups.call(this, space, true)
      if (more_models) {
        main_models = main_models.concat(more_models)
      }
      const clean_array = spv.getArrayNoDubs(main_models)
      const groups = []
      for (let i = 0; i < clean_array.length; i++) {
        const reqs = clean_array[i].getModelImmediateRequests(space)
        if (reqs && reqs.length) {
          groups.push(reqs)
        }
      }
      return groups
    }
  },

  dataListChange: function(_tems, rel_name) {
    if (!rel_name) {
      throw new Error('rel name should be provided')
    }

    const array = this.loadable_lists && this.loadable_lists[rel_name]
    _updateRel(this, rel_name, array)
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

  addDataItem: function(obj, skip_changes, nesting_name) {
    if (!nesting_name) {
      throw new Error('rel name should be provided')
    }

    if (!this.loadable_lists) {
      this.loadable_lists = {}
    }
    if (!this.loadable_lists[ nesting_name ]) {
      this.loadable_lists[ nesting_name ] = []
    }
    let item
    const work_array = this.loadable_lists[ nesting_name ]

    work_array.push(item = this.makeItemByData(obj, nesting_name))

    this.loadable_lists[ nesting_name ] = work_array
    if (!skip_changes) {
      _updateRel(this, nesting_name, work_array)
    }
    return item
  },

  getMainlist: function() {
    throw new Error('getMainlist is depricated')

    if (!this.loadable_lists) {
      this.loadable_lists = {}
    }
    if (!this.loadable_lists[ this.main_list_name ]) {
      this.loadable_lists[ this.main_list_name ] = []
    }
    return this.loadable_lists[ this.main_list_name ]
  },

  makeItemByData: function(data, nesting_name) {
    return makeItemByData(this, nesting_name, data)
  },
})

LoadableListBase.LoadableListBase = LoadableListBase

export default LoadableListBase
