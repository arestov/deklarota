import checkUniqOnAttrChange from '../../dcl/nests/uniq/checkUniqOnAttrChange'
import { checkRoutesMatchingOnAttrsChange } from '../../dcl/routes/run/checkRoutesMatching'
import { FlowStepDeliverChainUpdates } from '../flowStepHandlers.types'
import target_types from './target_types'

const { TARGET_TYPE_UNIQ_REL_BY_ATTR, TARGET_TYPE_ROUTE_MATCHING } = target_types

export default function scheduleDelivering(motivation_model, list) {
  const current_motivator = motivation_model._currentMotivator()
  const wrapper = null
  const calls_flow = motivation_model._getCallsFlow()

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    switch (cur.link.chain.target_type) {
      case TARGET_TYPE_UNIQ_REL_BY_ATTR: {
        checkUniqOnAttrChange(motivation_model, cur)
        continue
      }
      case TARGET_TYPE_ROUTE_MATCHING: {
        checkRoutesMatchingOnAttrsChange(cur)
      }
    }

    calls_flow.pushToFlow(
      // fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end
      FlowStepDeliverChainUpdates, cur.mention_owner, [cur.mention_owner, cur.link.chain], null, wrapper, undefined, current_motivator
    )
  }
};
