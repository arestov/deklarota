define(function(require) {
'use strict'

var triggerDie = require('../internal_events/die/trigger')

return function(self) {
  triggerDie(self)
}
})
