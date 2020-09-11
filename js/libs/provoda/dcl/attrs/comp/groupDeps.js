import asString from '../../../utils/multiPath/asString'
import isGlueTargetAttr from './isGlueTargetAttr'
import glueTargets from './glueTargets'
import { doRelSplit } from '../../glue_rels/splitComplexRel'

var rel_of_ascendor = glueTargets.rel_of_ascendor

function groupDeps(parse) {
  return function(list) {
    var states_of_parent = {}
    var states_of_nesting = {}
    var states_of_root = {}
    var connect_self = false
    var connect_glue = new Map()

    for (var i = 0; i < list.length; i++) {
      var cur = list[i]
      var deps_list = cur.depends_on
      var addrs = cur.addrs

      for (var jj = 0; jj < deps_list.length; jj++) {
        var addr = addrs[jj]
        var glue_target = isGlueTargetAttr(addr)

        if (glue_target === rel_of_ascendor) {
          var splited = doRelSplit(addr)
          connect_glue.set(asString(splited.source), splited)
          continue
        }

        if (glue_target != null) {
          continue
        }

        var state_name = deps_list[jj]
        var parsing_result = parse(state_name)
        if (!parsing_result) {
          continue
        }
        switch (parsing_result.rel_type) {
          case 'root': {
            if (!states_of_root[state_name]) {
              states_of_root[state_name] = parsing_result
            }
          }
          break
          case 'nesting': {
            if (!states_of_nesting[state_name]) {
              states_of_nesting[state_name] = parsing_result
            }
          }
          break
          case 'parent': {
            if (!states_of_parent[state_name]) {
              states_of_parent[state_name] = parsing_result
            }
          }
          break
          case 'self': {
            connect_self = connect_self || true
          }
          break
        }
      }
    }

    return {
      connect_self: connect_self,
      conndst_parent: toList(states_of_parent),
      conndst_nesting: toList(states_of_nesting),
      conndst_root: toList(states_of_root),
      connect_glue: [...connect_glue.values()],
    }
  }
}


function toList(obj) {
  var result = []
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      result.push(obj[p])
    }
  }
  return result
}

export default groupDeps
