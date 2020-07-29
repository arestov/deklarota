define(function() {
'use strict'
return function scheduleDelivering(self, list) {
  var current_motivator = self._currentMotivator()
  var wrapper = self.evcompanion.hndUsualEvCallbacksWrapper
  var calls_flow = self._getCallsFlow();

  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    calls_flow.pushToFlow(
      // fn, context, args, cbf_arg, cb_wrapper, real_context, motivator, finup, initiator, init_end
      cur.mention_owner.__deliverChainUpdates, cur.mention_owner, [cur.link.chain], null, wrapper, null, current_motivator
    );
  }
}

})
