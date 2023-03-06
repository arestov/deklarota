import type FlowStep from '../FlowStep'

const compareComplexOrder = function(array_one: readonly (number | undefined)[], array_two: readonly (number | undefined)[]): number | undefined {
  const max_length = Math.max(array_one.length, array_two.length)

  for (let i = 0; i < max_length; i++) {
    const item_one_step = array_one[i]
    const item_two_step = array_two[i]

    if (typeof item_one_step == 'undefined' && typeof item_two_step == 'undefined') {
      return undefined
    }
    if (typeof item_one_step == 'undefined') {
      // __[1, 2] vs [1, 2, 3] => __[1, 2], [1, 2, 3]
      return -1
    }
    if (typeof item_two_step == 'undefined') {
      // __[1, 2, 3] vs [1, 2] => [1, 2], __[1, 2, 3]
      return 1
    }
    if (item_one_step > item_two_step) {
      return 1
    }
    if (item_one_step < item_two_step) {
      return -1
    }
  }

  return undefined
}

const sortFlows = function(item_one: FlowStep, item_two: FlowStep): number | undefined {
  const none_one = !item_one || item_one.aborted
  const none_two = !item_two || item_two.aborted

  if (none_one && none_two) {
    return 0
  } else if (none_one) {
    return -1
  } else if (none_two) {
    return 1
  }

  if (item_one.finup && item_two.finup) {
    return 0
  } else if (item_one.finup) {
    return 1
  } else if (item_two.finup) {
    return -1
  }

  /*if (item_one.custom_order && item_two.custom_order) {

  } else if (item_one.custom_order) {

  } else if (item_two.custom_order) {

  }*/

  return compareComplexOrder(item_one.complex_order, item_two.complex_order)
}

export type FlowWithOrder = {
  flow_end: FlowStep | null,
  flow_start: FlowStep | null,
}

function toEnd(self: FlowWithOrder, flow_step: FlowStep): void {
  if (self.flow_end) {
    self.flow_end.next = flow_step
  }
  self.flow_end = flow_step
  if (!self.flow_start) {
    self.flow_start = flow_step
  }
}



function orderFlow(self: FlowWithOrder, flow_step: FlowStep): void {
  const last_item = self.flow_end

  const result = last_item && sortFlows(flow_step, last_item)

  if (result == null || result >= 0) {
    //очевидно, что новый элемент должен стать в конец
    toEnd(self, flow_step)
    return
  }

  let last_matched
  let cur
  for (cur = self.flow_start; cur; cur = cur.next) {
    const match_result = sortFlows(cur, flow_step)
    if (match_result == -1) {
      last_matched = cur
    } else {
      break
    }
  }

  if (!cur) {
    console.log('result', result, self.flow_start)
    throw new Error('something wrong')
  }

  if (!last_matched) {
    flow_step.next = self.flow_start
    self.flow_start = flow_step
  } else {
    flow_step.next = last_matched.next
    last_matched.next = flow_step
  }
}

export default orderFlow
