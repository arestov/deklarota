define(function(require) {
'use strict';

var spv = require('spv');
var sync_sender = require('./sync_sender');
var MDProxy = require('./MDProxy');
var hp = require('./helpers');
var getModelById = require('./utils/getModelById');
var views_proxies = require('./views_proxies');
var SyncReceiver = require('./SyncReceiver');
var Eventor = require('./Eventor');
var StatesEmitter = require('./StatesEmitter');
var Model = require('./Model');
var HModel = require('./Model/HModel')
var gentlyUpdateAttr = require('./StatesEmitter/gentlyUpdateAttr');
var initDeclaredNestings = require('./initDeclaredNestings');
var markStrucure = require('./structure/mark');
var create = require('./create');
var addSubpage = require('./dcl/sub_pager/addSubpage');
var behavior = require('./provoda/bhv')
var mergeBhv = require('./provoda/_lmerge');
var mpxUpdateAttr = require('./provoda/v/mpxUpdateAttr')

var provoda, pv;
var DeathMarker = function() {
  //helper to find memory leaks; if there is memory leaking DeathMarker will be available in memory heap snapshot;
};

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

pv = provoda = {
  hp: hp,
  $v: hp.$v,
  getRDep: hp.getRDep,
  utils: {
    isDepend: function(obj) {
      return obj && !!obj.count;
    }
  },
  initWebApp: function(root_md, RootViewConstr) {
    throw new Error('broken');

    var proxies_space = Date.now();
    var views_proxies = provoda.views_proxies;
    views_proxies.addSpaceById(proxies_space, root_md);
    var mpx = views_proxies.getMPX(proxies_space, root_md);

    (function() {
      var view = new RootViewConstr();
      mpx.addView(view, 'root');
      view.init({
        mpx: mpx,
        proxies_space: proxies_space
      }, {d: window.document});
      view.requestView();
      view = null;
    })();
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
    return function(){
      if (this[propcheck]){
        return this;
      } else {
        this[propcheck] = true;
        callback.apply(this, arguments);
        return this;
      }
    };
  },
  getParsedPath: initDeclaredNestings.getParsedPath,
  getSubpages: initDeclaredNestings.getSubpages,
  pathExecutor: initDeclaredNestings.pathExecutor,
  addSubpage: addSubpage,
  updateNesting: function(md, nesting_name, nesting_value, opts, spec_data) {
    md.updateNesting(nesting_name, nesting_value, opts, spec_data);
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
};



if ( typeof window === "object" && typeof window.document === "object" ) {
  window.provoda = provoda;
}
return provoda;
});
