

import sync_sender from './sync_sender'
import MDProxy from './MDProxy'
import hp from './helpers'
import getModelById from './utils/getModelById'
import views_proxies from './views_proxies'
import SyncReceiver from './SyncReceiver'
import Eventor from './Eventor'
import StatesEmitter from './StatesEmitter'
import Model from './Model'
import HModel from './Model/HModel'
import gentlyUpdateAttr from './StatesEmitter/gentlyUpdateAttr'
import initDeclaredNestings from './initDeclaredNestings'
import markStrucure from './structure/mark'
import create from './create'
import addSubpage from './dcl/sub_pager/addSubpage'
import behavior from './provoda/bhv'
import mergeBhv from './provoda/_lmerge'
import mpxUpdateAttr from './provoda/v/mpxUpdateAttr'

var DeathMarker = function() {
  //helper to find memory leaks; if there is memory leaking DeathMarker will be available in memory heap snapshot;
}

/*
var hasPrefixedProps = function(props, prefix) {
  for (var prop_name in props) {
    if (props.hasOwnProperty( prop_name ) && spv.startsWith( prop_name, prefix )){
      return true;
    }
  }
  return false;
};
*/

var provoda = {
  hp: hp,
  $v: hp.$v,
  getRDep: hp.getRDep,
  utils: {
    isDepend: function(obj) {
      return obj && !!obj.count
    }
  },
  initWebApp: function(root_md, RootViewConstr) {
    throw new Error('broken')

    var proxies_space = Date.now()
    var views_proxies = provoda.views_proxies
    views_proxies.addSpaceById(proxies_space, root_md)
    var mpx = views_proxies.getMPX(proxies_space, root_md);

    (function() {
      var view = new RootViewConstr()
      mpx.addView(view, 'root')
      view.init({
        mpx: mpx,
        proxies_space: proxies_space
      }, {d: window.document})
      view.requestView()
      view = null
    })()
  },
  getModelById: getModelById,
  MDProxy: MDProxy,
  SyncSender: sync_sender,
  SyncR: SyncReceiver,
  Eventor: Eventor.PublicEventor,
  StatesEmitter: StatesEmitter,
  Model: Model,
  HModel: HModel,
  views_proxies: views_proxies,
  getOCF: function(propcheck, callback) {
    //init once
    return function() {
      if (this[propcheck]) {
        return this
      } else {
        this[propcheck] = true
        callback.apply(this, arguments)
        return this
      }
    }
  },
  getParsedPath: initDeclaredNestings.getParsedPath,
  getSubpages: initDeclaredNestings.getSubpages,
  pathExecutor: initDeclaredNestings.pathExecutor,
  addSubpage: addSubpage,
  updateNesting: function(md, nesting_name, nesting_value, opts, spec_data) {
    md.updateNesting(nesting_name, nesting_value, opts, spec_data)
  },
  mpx: {
    update: mpxUpdateAttr,
  },
  update: gentlyUpdateAttr,
  state: hp.state,
  behavior: behavior,
  create: create,
  markStrucure: markStrucure,
  mergeBhv: mergeBhv,
}

export default provoda
