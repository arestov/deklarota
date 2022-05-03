import asString from '../../../utils/multiPath/asString'
import isGlueTargetAttr from './isGlueTargetAttr'
import glueTargets from './glueTargets'
import { doRelSplit } from '../../glue_rels/splitComplexRel'

const rel_of_ascendor = glueTargets.rel_of_ascendor

function groupDeps(parse) {
  return function(list, isView) {
    const states_of_parent = {}
    const states_of_nesting = {}
    const states_of_root = {}
    let connect_self = false
    const connect_glue = new Map()

    for (let i = 0; i < list.length; i++) {
      const cur = list[i]
      const deps_list = cur.depends_on
      const addrs = cur.addrs

      for (let jj = 0; jj < deps_list.length; jj++) {
        const addr = addrs[jj]
        const glue_target = isGlueTargetAttr(addr, isView)

        if (glue_target === rel_of_ascendor) {
          const splited = doRelSplit(addr)
          connect_glue.set(asString(splited.source), splited)
          continue
        }

        if (glue_target != null) {
          continue
        }

        if (addr.result_type != 'state') {
          continue
        }

        const state_name = deps_list[jj]
        const parsing_result = parse(state_name)
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

    return Object.freeze({
      connect_self: connect_self,
      conndst_parent: toList(states_of_parent),
      conndst_nesting: toList(states_of_nesting),
      conndst_root: toList(states_of_root),
      connect_glue: Object.freeze([...connect_glue.values()]),
    })
  }
}


function toList(obj) {
  const result = []
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      result.push(obj[p])
    }
  }
  Object.freeze(result)
  return result
}

export default groupDeps
