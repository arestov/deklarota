

var spv = require('spv')
var utils_simple = require('./utils/simple')
var pvState = require('./utils/state')
var stateGetter = require('./utils/stateGetter')
var probeDiff = require('./probeDiff')
var selecPoineertDeclr = require('./structure/selecPoineertDeclr')
var createTemplate = require('./View/createTemplate')
var getBwlevView = require('./View/getBwlevView')
var getViewLocationId = require('./View/getViewLocationId')
var getPropsPrefixChecker = require('./utils/getPropsPrefixChecker')
var getEncodedState = require('./utils/getEncodedState')
var getShortStateName = require('./utils/getShortStateName')
var getRemovedNestingItems = require('./utils/h/getRemovedNestingItems')
var groupMotive = require('./helpers/groupMotive')
var triggerDestroy = require('./helpers/triggerDestroy')
var getNetApiByDeclr = require('./helpers/getNetApiByDeclr')
var hndMotivationWrappper = require('./helpers/hndMotivationWrappper')


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
