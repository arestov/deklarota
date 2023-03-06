

const hasId = function(value) {
  return value && value._node_id
}


const replaceItem = function(item) {
  if (!hasId(item)) {
    return item
  }

  if (!item._highway) {
    return {
      _node_id: item._node_id,
    }
  }

  if (!item._highway.__model_replacers) {
    item._highway.__model_replacers = {}
  }

  item._highway.__model_replacers[item._node_id] = {
    _node_id: item._node_id,
  }

  return item._highway.__model_replacers[item._node_id]
}

const replaceModelInState = function(value) {
  if (!value) {
    return value
  }

  if (!Array.isArray(value)) {
    return replaceItem(value)

  }

  if (!value.some(hasId)) {
    return value
  }

  return value.map(replaceItem)
}

export default replaceModelInState
