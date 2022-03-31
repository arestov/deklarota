import MentionChain from '../../Model/mentions/MentionChain'
import target_types from '../../Model/mentions/target_types'
const { TARGET_TYPE_ROUTE_MATCHING } = target_types

const routesToMentionChains = (mut_result_list, model) => {
  if (model.__routes_matchers_defs == null) {
    return
  }

  for (let i = 0; i < model.__routes_matchers_defs.length; i++) {
    const dcl = model.__routes_matchers_defs[i]
    for (let i = 0; i < dcl.all_addrs.length; i++) {
      const addr = dcl.all_addrs[i]
      mut_result_list.push(new MentionChain(
        TARGET_TYPE_ROUTE_MATCHING,
        addr.nesting.path,
        model,
        addr,
        null,
        dcl
      ))
    }
  }
}

export default routesToMentionChains
