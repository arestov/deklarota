
import types from '../../../../FastEventor/stateReqTypes'
const boolean_types = types.boolean_types

function BooleanAttr(name) {
  this.name = name
}

BooleanAttr.prototype = {
  type: 'bool',
}

export default function(dcl) {
  dcl.boolean_attrs = []
  for (let i = 0; i < dcl.states_list.length; i++) {
    const states_name = dcl.states_list[i]

    for (let jj = 0; jj < boolean_types.length; jj++) {
      const suffix = boolean_types[jj]

      dcl.boolean_attrs.push(
        new BooleanAttr('$meta$attrs$' + states_name + '$' + suffix)
      )
    }
  }
}
