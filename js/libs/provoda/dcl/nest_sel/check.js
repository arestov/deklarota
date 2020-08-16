
var checkPrefix = require('../../StatesEmitter/checkPrefix')
var SelectNestingDeclaration = require('./item')

var checkNestSel = checkPrefix('nest_sel-', SelectNestingDeclaration, '_chi_nest_sel')

export default checkNestSel
