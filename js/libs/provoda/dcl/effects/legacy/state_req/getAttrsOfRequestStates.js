
var types = require('../../../../FastEventor/stateReqTypes')
var boolean_types = types.boolean_types

function BooleanAttr(name) {
  this.name = name
}

BooleanAttr.prototype = {
  type: 'bool',
}

export default function(dcl) {
  dcl.boolean_attrs = []
  for (var i = 0; i < dcl.states_list.length; i++) {
    var states_name = dcl.states_list[i]

    for (var jj = 0; jj < boolean_types.length; jj++) {
      var suffix = boolean_types[jj]

      dcl.boolean_attrs.push(
        new BooleanAttr(states_name + '__' + suffix),
        new BooleanAttr('$meta$states$' + states_name + '$' + suffix)
      )
    }
  }
};
