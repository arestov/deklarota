
import spv from '../../spv'
import { doCopy } from '../../spv/cloneObj'

import definedAttrs from '../Model/definedAttrs'
import AttrsCollector from '../StatesEmitter/AttrsCollector'
import RootLev from '../bwlev/RootLev'
import BrowseLevel from '../bwlev/BrowseLevel'
import globalSkeleton from './globalSkeleton'
import {clearCache as clearCacheCompAttr} from '../dcl/attrs/comp/parseItems'
import {clearCache as clearCacheCompGlue} from '../dcl/attrs/comp/extendByServiceAttrs'
import {clearCache as clearCacheMultiPathParse} from '../utils/multiPath/parse'
import {clearCache as clearCacheMultiPathLegacy} from '../utils/multiPath/fromLegacy'
import {clearCache as clearCacheLegacyAddr} from '../utils/getParsedState.js'
import splitByDot from '../../spv/splitByDot'

function makePath(parent_path, current_name) {
  var used_name = [current_name || 'unknown']
  if (!parent_path) {
    return used_name
  }

  return parent_path.concat(used_name)
}

function mark(Constr, RootConstr, ascent_level, parent_path) {
  var next_ascent_level = ascent_level + 1
  RootConstr.hierarchy_counter = RootConstr.hierarchy_counter || 0

  var self = Constr.prototype

  if (Constr == RootConstr) {
    self.__all_constrs = {}
    self.__global_skeleton = new globalSkeleton.GlobalSkeleton()
  }

  self.hierarchy_num = RootConstr.hierarchy_counter++

  self._all_chi = {}

  var all = {}

  doCopy(all, self._chi)
  doCopy(all, self._chi_sub_pager)
  doCopy(all, self._chi_sub_pages)
  doCopy(all, self._chi_sub_pages_side)
  doCopy(all, self._chi_nest)
  doCopy(all, self._chi_nest_rqc)

  for (var prop in all) {
    var cur = all[prop]
    if (!cur) {
      self._all_chi[prop] = null
      continue
    }

    var hierarchy_path = makePath(parent_path, cur.prototype.hierarchy_name)

    var item = spv.inh(all[prop], {
      skip_code_path: true
    }, {
      pconstr_id: self.constr_id,
      _parent_constr: Constr,
      _root_constr: RootConstr,
      hierarchy_path: hierarchy_path,
      hierarchy_path_string: hierarchy_path.join('  ')
    })

    self._all_chi[prop] = mark(item, RootConstr, next_ascent_level, hierarchy_path)
  }

  if (Constr == RootConstr) {
    if (self.zero_map_level) {
      self.start_page = self
    } else {
      var start_page = self._all_chi['chi-start__page']
      self.start_page = (start_page && start_page.prototype) || self
    }

    var __BWLev = spv.inh(RootLev, { skip_code_path: true }, self.BWLev || {})
    __BWLev.hierarchy_counter = RootConstr.hierarchy_counter++

    self.__BWLev = mark(__BWLev, RootConstr, next_ascent_level)
    self._all_chi.__BWLev = self.__BWLev

    self.CBWL = mark(BrowseLevel, RootConstr, next_ascent_level)
    self._all_chi.CBWL = self.CBWL
  }

  self._attrs_collector = new AttrsCollector(definedAttrs(self))

  self.__global_skeleton = RootConstr.prototype.__global_skeleton
  globalSkeleton.addModel(self.__global_skeleton, self, ascent_level, Constr == RootConstr)


  if (Constr == RootConstr) {
    globalSkeleton.complete(self.__global_skeleton)
    clearCaches()
  }

  RootConstr.prototype.__all_constrs[self.hierarchy_num] = self
  return Constr
}

function clearCaches() {
  // caches should not be singleton.
  // all build process should be done in mark() fn, not during onExtend fn
  clearCacheCompAttr()
  clearCacheCompGlue()
  clearCacheMultiPathParse()
  clearCacheMultiPathLegacy()
  clearCacheLegacyAddr()
  splitByDot.__clear()
}

export default mark
