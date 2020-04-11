define(function(require) {
"use strict";

var spv = require('spv');
var utils_simple = require('./utils/simple')
var pvState = require('./utils/state');
var stateGetter = require('./utils/stateGetter');
var probeDiff = require('./probeDiff');
var selecPoineertDeclr = require('./structure/selecPoineertDeclr');
var createTemplate = require('./View/createTemplate')
var getBwlevView = require('./View/getBwlevView')
var getViewLocationId = require('./View/getViewLocationId')
var getPropsPrefixChecker = require('./utils/getPropsPrefixChecker');
var getEncodedState = require('./utils/getEncodedState');
var getShortStateName = require('./utils/getShortStateName');
var getRemovedNestingItems = require('./utils/h/getRemovedNestingItems')
var groupMotive = require('./helpers/groupMotive')
var triggerDestroy = require('./helpers/triggerDestroy')


var nil = spv.nil;
var memorize = spv.memorize
var startsWith = spv.startsWith;

function getBwlevId(view) {
  return getBwlevView(view).mpx._provoda_id;
}

return {
  probeDiff: probeDiff,
  getRDep: (function() {
    var getTargetName = memorize(function getTargetName(state_name) {
      return state_name.split( ':' )[ 1 ];
    });

    return function(state_name) {
      var target_name = getTargetName(state_name);
      return function(target, state, oldstate) {
        if (oldstate) {
          oldstate.setStateDependence(target_name, target, false);
        }
        if (state) {
          state.setStateDependence(target_name, target, true);
        }
      };
    };

  })(),
  state: pvState,
  triggerDestroy: triggerDestroy,
  wipeObj: utils_simple.wipeObj,
  markFlowSteps: utils_simple.markFlowSteps,
  getRightNestingName: function(md, nesting_name) {
    if (md.preview_nesting_source && nesting_name == 'preview_list') {
      nesting_name = md.preview_nesting_source;
    } else if (nesting_name == md.preview_mlist_name){
      nesting_name = md.main_list_name;
    }
    return nesting_name;
  },
  getShortStateName: getShortStateName,
  stateGetter: stateGetter,
  getEncodedState: getEncodedState,
  getNetApiByDeclr: function(send_declr, sputnik, app) {
    var api_name = send_declr.api_name;
    if (typeof api_name == 'function') {
      return api_name.call(sputnik);
    }

    if (typeof api_name !== 'string') {
      return;
    }

    if (startsWith(api_name, '#')) {
      return (app || sputnik.app)._interfaces_using.used[api_name.replace('#', '')];
    }

    return sputnik._interfaces_using.used[api_name];
  },
  getPropsPrefixChecker: getPropsPrefixChecker,
  _groupMotive: groupMotive,
  getSTEVNameVIP: utils_simple.getSTEVNameVIP,
  getSTEVNameDefault: utils_simple.getSTEVNameDefault,
  getSTEVNameLight: utils_simple.getSTEVNameLight,
  getFullChilChEvName: utils_simple.getFullChilChEvName,
  getRemovedNestingItems: getRemovedNestingItems,
  oop_ext: {
    hndMotivationWrappper: function(motivator, fn, context, args, arg) {
      if (motivator.p_space) {
        this.zdsv.removeFlowStep(motivator.p_space, motivator.p_index_key, motivator);
      }

      if (this.isAliveFast && !this.isAliveFast()) {
        return;
      }

      //устанавливаем мотиватор конечному пользователю события
      var ov_c = context.current_motivator;
      context.current_motivator = motivator;

      var ov_t;

      if (this != context) {
        //устанавливаем мотиватор реальному владельцу события, чтобы его могли взять вручную
        //что-то вроде api
        ov_t = this.current_motivator;
        this.current_motivator = motivator;
      }

      if (args){
        fn.apply(context, args);
      } else {
        fn.call(context, arg);
      }

      if (context.current_motivator != motivator){
        throw new Error('wrong motivator'); //тот кто поменял current_motivator должен был вернуть его обратно
      }
      context.current_motivator = ov_c;

      if (this != context) {
        if (this.current_motivator != motivator){
          throw new Error('wrong motivator'); //тот кто поменял current_motivator должен был вернуть его обратно
        }
        this.current_motivator = ov_t;
      }
    }
  },
  $v: {
    getBwlevView: getBwlevView,
    getBwlevId: getBwlevId,
    getViewLocationId: getViewLocationId,
    createTemplate: createTemplate,
    matchByParent: function(views, parent_view) {
      for (var i = 0; i < views.length; i++) {
        var cur = views[i];
        var item = cur;
        while (item.parent_view && item.parent_bwlev != item.root_view) {
          if (item.parent_view == parent_view) {
            return cur;
          }
          item = item.parent_view;
        }
      }
    },
    selecPoineertDeclr: selecPoineertDeclr,
  }

};

});
