
import spv from '../../spv'
import { doCopy } from '../../spv/cloneObj'

import definedAttrs from '../Model/definedAttrs'
import AttrsCollector from '../AttrsOwner/AttrsCollector'
import RootLev from '../bwlev/RootLev'
import globalSkeleton from './globalSkeleton'
import analyzeLinks from './analyzeLinks'

import {clearCache as clearCacheCompAttr} from '../dcl/attrs/comp/parseItems'
import {clearCache as clearCacheCompGlue} from '../dcl/attrs/comp/extendByServiceAttrs'
import {clearCache as clearCacheMultiPathParse} from '../utils/multiPath/parse'
import {clearCache as clearCacheMultiPathLegacy} from '../utils/multiPath/fromLegacy'
import {clearCache as clearCacheLegacyAddr} from '../utils/getParsedState'
import splitByDot from '../../spv/splitByDot'

function makePath(parent_path, current_name) {
  const used_name = [current_name || 'unknown']
  if (!parent_path) {
    return used_name
  }

  return parent_path.concat(used_name)
}

function mark(Constr, RootConstr, ascent_level, parent_path) {
  const next_ascent_level = ascent_level + 1
  RootConstr.hierarchy_counter = RootConstr.hierarchy_counter || 0

  const self = Constr.prototype

  if (!self.model_name) {
    const err = new Error('model should have model_name')
    console.error(self.__code_path, err)
    throw err
  }

  if (Constr == RootConstr) {
    self.__all_constrs = {}
    self.__global_skeleton = new globalSkeleton.GlobalSkeleton()
    self.constrs_by_name = new Map()
  }

  self.RootConstr = RootConstr
  // _root_constr

  self.hierarchy_num = RootConstr.hierarchy_counter++

  self._all_chi = {}

  const all = {}

  doCopy(all, self._chi)
  doCopy(all, self._chi_nest)
  doCopy(all, self._chi_nest_rqc)

  for (const prop in all) {
    const cur = all[prop]
    if (!cur) {
      self._all_chi[prop] = null
      continue
    }

    const hierarchy_path = makePath(parent_path, cur.prototype.hierarchy_name)

    const item = spv.inh(all[prop], {
      skip_code_path: true
    }, {
      pconstr_id: self.constr_id,
      _parent_constr: Constr,
      _root_constr: RootConstr,
      hierarchy_path: hierarchy_path,
      hierarchy_path_string: hierarchy_path.join('  '),
    })

    self._all_chi[prop] = mark(item, RootConstr, next_ascent_level, hierarchy_path)
  }

  if (Constr == RootConstr) {
    if (self.zero_map_level) {
      self.start_page = self
    } else {
      const start_page = self._all_chi['chi-start__page']
      self.start_page = (start_page && start_page.prototype) || self
    }

    const __BWLev = spv.inh(RootLev, { skip_code_path: true }, self.BWLev || {})
    __BWLev.hierarchy_counter = RootConstr.hierarchy_counter++

    self.__BWLev = mark(__BWLev, RootConstr, next_ascent_level)
    self._all_chi.__BWLev = self.__BWLev
  }

  self._attrs_collector = new AttrsCollector(definedAttrs(self))

  self.__global_skeleton = RootConstr.prototype.__global_skeleton
  globalSkeleton.addModel(self.__global_skeleton, self, ascent_level, Constr == RootConstr)


  if (Constr == RootConstr) {
    globalSkeleton.complete(self.__global_skeleton)
    analyzeLinks(Constr, RootConstr)
    clearCaches()
  }

  const root_item = RootConstr.prototype

  if (root_item.constrs_by_name.has(self.model_name)) {
    const err = new Error('model should have uniq model_name')
    console.error(err, '\n', self.model_name, self.__code_path)
    throw err
  }

  root_item.constrs_by_name.set(self.model_name, self)

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
