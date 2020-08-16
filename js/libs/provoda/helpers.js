

import spv from 'spv'
import utils_simple from './utils/simple'
import pvState from './utils/state'
import stateGetter from './utils/stateGetter'
import probeDiff from './probeDiff'
import selecPoineertDeclr from './structure/selecPoineertDeclr'
import createTemplate from './View/createTemplate'
import getBwlevView from './View/getBwlevView'
import getViewLocationId from './View/getViewLocationId'
import getPropsPrefixChecker from './utils/getPropsPrefixChecker'
import getEncodedState from './utils/getEncodedState'
import getShortStateName from './utils/getShortStateName'
import getRemovedNestingItems from './utils/h/getRemovedNestingItems'
import groupMotive from './helpers/groupMotive'
import triggerDestroy from './helpers/triggerDestroy'
import getNetApiByDeclr from './helpers/getNetApiByDeclr'
import hndMotivationWrappper from './helpers/hndMotivationWrappper'


var memorize = spv.memorize

function getBwlevId(view) {
  return getBwlevView(view).mpx._provoda_id
}

export default {
  probeDiff: probeDiff,
  getRDep: (function() {
    var getTargetName = memorize(function getTargetName(state_name) {
      return state_name.split(':')[ 1 ]
    })

    return function(state_name) {
      var target_name = getTargetName(state_name)
      return function(target, state, oldstate) {
        if (oldstate) {
          oldstate.setStateDependence(target_name, target, false)
        }
        if (state) {
          state.setStateDependence(target_name, target, true)
        }
      }
    }

  })(),
  state: pvState,
  triggerDestroy: triggerDestroy,
  wipeObj: utils_simple.wipeObj,
  markFlowSteps: utils_simple.markFlowSteps,
  getRightNestingName: function(md, nesting_name) {
    return nesting_name
  },
  getShortStateName: getShortStateName,
  stateGetter: stateGetter,
  getEncodedState: getEncodedState,
  getNetApiByDeclr: getNetApiByDeclr,
  getPropsPrefixChecker: getPropsPrefixChecker,
  _groupMotive: groupMotive,
  getSTEVNameLight: utils_simple.getSTEVNameLight,
  getRemovedNestingItems: getRemovedNestingItems,
  oop_ext: {
    hndMotivationWrappper: hndMotivationWrappper,
  },
  $v: {
    getBwlevView: getBwlevView,
    getBwlevId: getBwlevId,
    getViewLocationId: getViewLocationId,
    createTemplate: createTemplate,
    matchByParent: function(views, parent_view) {
      for (var i = 0; i < views.length; i++) {
        var cur = views[i]
        var item = cur
        while (item.parent_view && item.parent_bwlev != item.root_view) {
          if (item.parent_view == parent_view) {
            return cur
          }
          item = item.parent_view
        }
      }
    },
    selecPoineertDeclr: selecPoineertDeclr,
  }

}
