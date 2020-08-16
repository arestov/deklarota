
var stateGetter = require('./stateGetter')
var getter = stateGetter

export default function(item, state_path) {
  var getField = getter(state_path)

  if (item._lbr && item._lbr.undetailed_states) {
    return getField(item._lbr.undetailed_states)
  }

  return getField(item.states)
};
