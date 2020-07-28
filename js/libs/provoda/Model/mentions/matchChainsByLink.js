define(function(require) {
'use strict'
var getDepValue = require('../../utils/multiPath/getDepValue')


var getAllOnwers = function(mut_result_list, mention_owner, link) {
  var cur_link = link

  if (cur_link.num == 0) {
    if (cur_link.chain.target_mc == mention_owner.constructor.prototype) {
      mut_result_list.push({
        mention_owner: mention_owner,
        link: cur_link,
      })
    }
    return
  }

  if (mention_owner.__mentions_as_rel == null) {
    return
  }

  var next_link = cur_link.chain.list[cur_link.num - 1]

  var owners = mention_owner.__mentions_as_rel[next_link.rel]
  if (owners == null) {
    return
  }


  for (var mm = 0; mm < owners.list.length; mm++) {
    var cur_owner = owners.list[mm]

    getAllOnwers(mut_result_list, cur_owner, next_link)
  }

  return mut_result_list
}

function scheduleDelivering(self, list) {
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

var matchChainsByLink = function(mention_owner, links) {
  var result = []
  for (var i = 0; i < links.length; i++) {
    getAllOnwers(result, mention_owner, links[i])
  }

  scheduleDelivering(mention_owner, result)

  return result
}


return matchChainsByLink
})
