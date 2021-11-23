

export default function scheduleDelivering(motivation_model, list) {
  const current_motivator = motivation_model._currentMotivator()
  const wrapper = motivation_model.evcompanion.hndUsualEvCallbacksWrapper
  const calls_flow = motivation_model._getCallsFlow()

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    calls_flow.pushToFlow(
      // fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end
      cur.mention_owner.__deliverChainUpdates, cur.mention_owner, [cur.link.chain], null, wrapper, null, current_motivator
    )
  }
};
