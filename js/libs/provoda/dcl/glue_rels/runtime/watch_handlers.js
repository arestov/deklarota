import _updateRel from '../../../_internal/_updateRel'

var emptyArray = Object.seal([])

var changeValue = function(current_motivator, data, value) {
  if (!current_motivator) {
    throw new Error('should be current_motivator')
  }

  _updateRel(data.md, data.meta_relation, value)
}

var getValue = function(list) {
  if (list == null) {
    return list
  }

  if (!Array.isArray(list)) {
    return list
  }

  if (!list.length) {
    return emptyArray
  }

  // we can get same, but mutated `value`
  // (lwroot.ordered_items is reusable)
  return list.slice(0)
}


export default {
  hnest_state: function(motivator, __, lwroot) {
    var data = lwroot.data

    changeValue(motivator, data, getValue(lwroot.ordered_items))
  },
  hnest: function nestCompxNestDepChangeHandler(current_motivator, _, lwroot) {
    var data = lwroot.data

    changeValue(current_motivator, data, getValue(lwroot.ordered_items))
  },
}
