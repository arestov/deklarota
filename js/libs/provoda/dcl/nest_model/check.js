define(function(require) {
'use strict';
var checkPrefix = require('../../StatesEmitter/checkPrefix');
var constr_mention = require('../../structure/constr_mention');

var nestConstructor = constr_mention.nestConstructor;
var checkNestRqC = checkPrefix('nest_rqc-', nestConstructor, '__nest_rqc');

return checkNestRqC;
})
