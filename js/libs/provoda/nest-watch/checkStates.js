
import orderItems from './orderItems'

export default function(etr, state_name, value, cur_value) {
  const links = etr.states_links && etr.states_links[state_name]
  if (!links) {return}
  for (let k = 0; k < links.length; k++) {
    const cur = links[k]
    if (!cur.state_handler) {
      // TODO if we don't have state_handler that we don't need order and preparations to keep order
      continue
    }
    // var calls_flow = (opts && opts.emergency) ? main_calls_flow : this.sputnik._getCallsFlow();
    const calls_flow = etr._getCallsFlow()
    calls_flow.pushToFlow(null, cur, [state_name, value, cur_value, etr], null, handleStates, null, etr.current_motivator)

  }
}

function handleStates(motivator, _, lnwatch, args) {
  // TODO if we don't have state_handler that we don't need order and preparations to keep order
  orderItems(lnwatch)
  lnwatch.state_handler.call(null, motivator, _, lnwatch, args)
}
