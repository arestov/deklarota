
import addRemove from './add-remove'
import orderItems from './orderItems'
const checkNestWatchs = addRemove.checkNestWatchs

export default function checkNesting(self, collection_name, array, removed) {
  checkNestWatchs(self, collection_name, array, removed)

  const changed_nawchs = checkChangedNestWatchs(self, collection_name)
  if (!changed_nawchs) {return}
  //var calls_flow = (opts && opts.emergency) ? main_calls_flow : self.sputnik._getCallsFlow();
  const calls_flow = self._getCallsFlow()
  for (let i = 0; i < changed_nawchs.length; i++) {
    const cur = changed_nawchs[i]
    if (!cur.nwatch.handler) {
      continue
      // TODO if we don't have state_handler that we don't need order and preparations to keep order
    }
    calls_flow.pushToFlow(null, cur.nwatch, null, array, handleEndItems, null, self.current_motivator)
  }
}



function handleEndItems(motivator, _, lnwatch) {
  orderItems(lnwatch)
  lnwatch.handler.call(null, motivator, null, lnwatch, null, lnwatch.ordered_items)
}

function checkChangedNestWatchs(md, collection_name) {
  if (!md.nes_match_index || !md.nes_match_index[collection_name]) {return}
  // console.log('match!', collection_name);

  /* список subl_wtch (локальных элементов следящих за гнёздами) */
  const subl_wtchs = md.nes_match_index[collection_name]

  const result = []
  for (let i = 0; i < subl_wtchs.length; i++) {
    const cur = subl_wtchs[i]
    if (cur.nwatch.ordered_items_changed) {
      result.push(cur)
      // console.log(cur.selector, cur);
    }

  }

  return result.length && result
}
