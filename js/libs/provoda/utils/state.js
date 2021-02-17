export default function(item, state_path) {
  if (item.is_messaging_model) {
    return item.getAttr(state_path)
  }

  if (item._lbr != null && item._lbr.undetailed_states != null) {
    return item._lbr.undetailed_states[state_path]
  }

  return item.states[state_path]
}
