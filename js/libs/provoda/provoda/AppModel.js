
import spv from '../../spv'
import LoadableList from './LoadableList'
import BrowseMap from './BrowseMap'
import SessionRoot from '../bwlev/SessionRoot'

const APP_ROOT_ID = 1

const AppModelBase = spv.inh(LoadableList, {
  naming: function(fn) {
    return function AppModelBase(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  preinit: function(target) {
    target.app = target
  },
  postInit: function(target) {
    if (target._provoda_id !== APP_ROOT_ID) {
      throw new Error('app root should be ' + APP_ROOT_ID)
    }

    if (target.hasOwnProperty('start_page')) {
      const isOk = target.start_page instanceof target.constructor.prototype.start_page.constructor
      if (!isOk) {
        if (target.zero_map_level) {
          throw new Error('provide constructor of start_page or set zero_map_level to false')
        }
        throw new Error('provide constructor of start_page')
      }
    }
    if (target.zero_map_level) {
      // start_page will be app root

      if (target.hasOwnProperty('start_page')) {
        return
      }
      target.start_page = target
      return
    }

    if (!target['chi-start__page']) {
      console.warn('add chi-start__page or zero_map_level:true to AppModelBase')
      return
    }

    if (target.hasOwnProperty('start_page')) {
      return
    }
    target.start_page = target.initChi('start__page')
  }
}, {
  model_name: 'app_model',
  rels: {
    $root: ['input', {linking: '<<<<'}],
    $session_root: ['model', SessionRoot],
  },
  routePathByModels: function(pth_string, start_md, need_constr, strict, options, extra_states) {
    return BrowseMap.routePathByModels(start_md || this.start_page, pth_string, need_constr, strict, options, extra_states)
  },
})


export default AppModelBase
