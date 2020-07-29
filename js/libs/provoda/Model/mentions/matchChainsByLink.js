define(function(require) {
'use strict'
var getDepValue = require('../../utils/multiPath/getDepValue')
var scheduleDelivering = require('./scheduleDelivering')
var getAllOnwers = require('./getAllOnwers')


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
