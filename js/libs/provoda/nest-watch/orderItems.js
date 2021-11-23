
const push = Array.prototype.push
const reusable_array = []

export default function orderItems(lnwatch) {
  if (!lnwatch.ordered_items_changed) {return}
  lnwatch.ordered_items_changed = false

  reusable_array.length = 0
  for (const prop in lnwatch.model_groups) {
    const cur = lnwatch.model_groups[prop]
    reusable_array.push(cur)
  }

  reusable_array.sort(compareComplexOrder)

  const result = lnwatch.ordered_items || []
  result.length = 0
  for (let i = 0; i < reusable_array.length; i++) {
    const cur = reusable_array[i]
    if (cur.models_list) {
      push.apply(result, cur.models_list)
    }
  }

  reusable_array.length = 0
  lnwatch.ordered_items = result
};

function compareComplexOrder(item_one, item_two) {
  let cur_one = item_one
  let cur_two = item_two

  while (cur_one || cur_two) {
    const num_one = cur_one && cur_one.position
    const num_two = cur_two && cur_two.position

    if (typeof num_one == 'undefined' && typeof num_two == 'undefined') {
      // should not be possible
      return
    }
    if (typeof num_one == 'undefined') {
      // should not be possible
      // __[1, 2] vs [1, 2, 3] => __[1, 2], [1, 2, 3]
      return -1
    }
    if (typeof num_two == 'undefined') {
      // should not be possible
      // __[1, 2, 3] vs [1, 2] => [1, 2], __[1, 2, 3]
      return 1
    }
    if (num_one > num_two) {
      return 1
    }
    if (num_one < num_two) {
      return -1
    }

    cur_one = cur_one.parent
    cur_two = cur_two.parent
  }
}
