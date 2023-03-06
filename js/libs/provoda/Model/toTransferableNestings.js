const toTransferableNestings = function(value) {
  if (!value) {
    return value
  }

  if (value._node_id) {
    return value._node_id
  } else if (Array.isArray(value)) {

    const parsed_value = new Array(value.length)
    for (let jj = 0; jj < value.length; jj++) {
      parsed_value[jj] = value[jj]._node_id
    }
    return parsed_value
  } else {
    console.warn('unparsed', value)
  }

  return value
}


export default toTransferableNestings
