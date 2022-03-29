import MentionChain from '../../../Model/mentions/MentionChain'
import target_types from '../../../Model/mentions/target_types'
import { createAddrByPart, getNestInfo, getStateInfo } from '../../../utils/multiPath/parse'
const { TARGET_TYPE_UNIQ_REL_BY_ATTR } = target_types

const uniqRelToMentionChain = (mut_result_list, model) => {

  if (model.__dcls_rels_uniq == null) {
    return
  }

  for (let i = 0; i < model.__dcls_rels_uniq.length; i++) {
    const dcl = model.__dcls_rels_uniq[i]
    for (let jj = 0; jj < dcl.rel_shape.uniq.length; jj++) {
      const attr = dcl.rel_shape.uniq[jj]

      const addr = createAddrByPart({
        state:  getStateInfo(attr),
        nesting: getNestInfo(dcl.rel_name)
      })
      mut_result_list.push(new MentionChain(
        TARGET_TYPE_UNIQ_REL_BY_ATTR,
        addr.nesting.path,
        model,
        addr,
        null,
        dcl
      ))
    }
  }
}

export default uniqRelToMentionChain
