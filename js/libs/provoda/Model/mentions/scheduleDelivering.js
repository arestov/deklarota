import checkUniqOnAttrChange from '../../dcl/nests/uniq/checkUniqOnAttrChange'
import target_types from './target_types'

const { TARGET_TYPE_UNIQ_REL_BY_ATTR } = target_types

export default function scheduleDelivering(motivation_model, list) {
  const current_motivator = motivation_model._currentMotivator()
  const wrapper = motivation_model.evcompanion.hndUsualEvCallbacksWrapper
  const calls_flow = motivation_model._getCallsFlow()

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    if (cur.link.chain.target_type === TARGET_TYPE_UNIQ_REL_BY_ATTR) {
      checkUniqOnAttrChange(motivation_model, cur)
      continue
    }

    calls_flow.pushToFlow(
      // fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end
      cur.mention_owner.__deliverChainUpdates, cur.mention_owner, [cur.link.chain], null, wrapper, null, current_motivator
    )
  }
};
