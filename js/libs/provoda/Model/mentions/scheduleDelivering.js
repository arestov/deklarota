define(function() {
'use strict'
return function scheduleDelivering(motivation_model, list) {
  var current_motivator = motivation_model._currentMotivator()
  var wrapper = motivation_model.evcompanion.hndUsualEvCallbacksWrapper
  var calls_flow = motivation_model._getCallsFlow();

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    calls_flow.pushToFlow(
      // fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end
      cur.mention_owner.__deliverChainUpdates, cur.mention_owner, [cur.link.chain], null, wrapper, null, current_motivator
    );
  }
}

})
