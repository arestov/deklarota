import { arrayExclude } from '../../../../spv'
import { MutUniqState } from './MutUniqState'

const checkUniqOnAttrChange = (md, match) => {
  const mention_chain = match.link.chain
  const rel_info = mention_chain.addr.nesting
  const rel_name = rel_info.target_nest_name
  const rel_value = match.mention_owner.getNesting(rel_name)
  const rel_clean = arrayExclude(rel_value, md)

  const attr_name = mention_chain.addr.state.path

  const mut_uniq_state = new MutUniqState([attr_name], rel_clean)
  const current_attr_value = md.getAttr(attr_name)

  if (!mut_uniq_state.indices[attr_name].has(current_attr_value)) {
    return
  }

  const err = new Error('attr should be uniq across defined rel')
  console.error(err, rel_value, {attr_owner: md, rel_owner: match.mention_owner})
  throw err
}

export default checkUniqOnAttrChange