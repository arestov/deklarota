define(function(require) {
'use strict'
var checkPrefix = require('../../StatesEmitter/checkPrefix')
var item = require('./item')

var checkNestRqC = checkPrefix('nest_rqc-', item, '__nest_rqc')

return checkNestRqC
})
