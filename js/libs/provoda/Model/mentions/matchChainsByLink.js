define(function(require) {
'use strict'
var scheduleDelivering = require('./scheduleDelivering')
var getAllOnwers = require('./getAllOnwers')


var matchChainsByLink = function(mention_owner, links) {
  var result = []
  for (var i = 0; i < links.length; i++) {
    getAllOnwers(result, mention_owner, links[i])
  }

  var motivation_model = mention_owner

  scheduleDelivering(motivation_model, result)

  return result
}


return matchChainsByLink
})
