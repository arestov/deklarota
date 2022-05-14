import utils_simple from './utils/simple'
import pvState from './utils/state'
import selecPoineertDeclr from './structure/selecPoineertDeclr'
import getBwlevView from './View/getBwlevView'
import getViewLocationId from './View/getViewLocationId'
import getPropsPrefixChecker from './utils/getPropsPrefixChecker'
import getEncodedState from './utils/getEncodedState'
import getShortStateName from './utils/getShortStateName'
import getRemovedNestingItems from './utils/h/getRemovedNestingItems'
import groupMotive from './helpers/groupMotive'
import getNetApiByDeclr from './helpers/getNetApiByDeclr'


function getBwlevId(view) {
  return getBwlevView(view).mpx._provoda_id
}

export default {
  state: pvState,
  wipeObj: utils_simple.wipeObj,
  getRightNestingName: function(_md, nesting_name) {
    return nesting_name
  },
  getShortStateName: getShortStateName,
  getEncodedState: getEncodedState,
  getNetApiByDeclr: getNetApiByDeclr,
  getPropsPrefixChecker: getPropsPrefixChecker,
  _groupMotive: groupMotive,
  getSTEVNameLight: utils_simple.getSTEVNameLight,
  getRemovedNestingItems: getRemovedNestingItems,
  oop_ext: {
  },
  $v: {
    getBwlevView: getBwlevView,
    getBwlevId: getBwlevId,
    getViewLocationId: getViewLocationId,
    matchByParent: function(views, parent_view) {
      for (let i = 0; i < views.length; i++) {
        const cur = views[i]
        let item = cur
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
