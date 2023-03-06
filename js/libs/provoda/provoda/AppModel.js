
import LoadableList from './LoadableList'
import BrowseMap from './BrowseMap'
import SessionRoot from '../bwlev/SessionRoot'
import { APP_ROOT_ID } from '../Model/APP_ROOT_ID'
import spvExtend from '../../spv/inh'


const AppModelBase = spvExtend(LoadableList, {
  naming: function(fn) {
    return function AppModelBase(opts, data, params, more, states) {
      fn(this, opts, data, params, more, states)
    }
  },
  preinit: function(target) {
    target.app = target
  },
  postInit: function(target) {
    if (target._node_id !== APP_ROOT_ID) {
      throw new Error('app root should be ' + APP_ROOT_ID)
    }

    if (!target.hasOwnProperty('start_page')) {
      target.start_page = target
    }

    if (target.start_page != target) {
      throw new Error('start_page should be App')
    }

    if (target.hasOwnProperty('start_page')) {
      const isOk = target.start_page instanceof target.constructor.prototype.start_page.constructor
      if (!isOk) {
        throw new Error('provide constructor of start_page')
      }
    }
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
