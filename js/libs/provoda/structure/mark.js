
import spv from '../../spv'
import definedAttrs from '../Model/definedAttrs'
import AttrsCollector from '../StatesEmitter/AttrsCollector'
import RootLev from '../bwlev/RootLev'
import BrowseLevel from '../bwlev/BrowseLevel'
import globalSkeleton from './globalSkeleton'

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
    self.__global_skeleton = new globalSkeleton.GlobalSkeleton()
  }

  self.hierarchy_num = RootConstr.hierarchy_counter++

  self._all_chi = {}

  var all = {}

  spv.cloneObj(all, self._chi)
  spv.cloneObj(all, self._chi_sub_pager)
  spv.cloneObj(all, self._chi_sub_pages)
  spv.cloneObj(all, self._chi_sub_pages_side)
  spv.cloneObj(all, self._chi_nest)
  spv.cloneObj(all, self._chi_nest_rqc)

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

    var __BWLev = spv.inh(RootLev, {}, self.BWLev || {})
    __BWLev.hierarchy_counter = RootConstr.hierarchy_counter++

    self.__BWLev = mark(__BWLev, RootConstr, next_ascent_level)

    self.CBWL = mark(BrowseLevel, RootConstr, next_ascent_level)
  }

  self._attrs_collector = new AttrsCollector(definedAttrs(self))

  self.__global_skeleton = RootConstr.prototype.__global_skeleton
  globalSkeleton.addModel(self.__global_skeleton, self, ascent_level, Constr == RootConstr)


  if (Constr == RootConstr) {
    globalSkeleton.complete(self.__global_skeleton)
  }
  return Constr
}

export default mark
