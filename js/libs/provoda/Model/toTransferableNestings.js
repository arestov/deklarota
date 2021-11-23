const toTransferableNestings = function(value) {
  if (!value) {
    return value
  }

  if (value._provoda_id) {
    return value._provoda_id
  } else if (Array.isArray(value)) {

    const parsed_value = new Array(value.length)
    for (let jj = 0; jj < value.length; jj++) {
      parsed_value[jj] = value[jj]._provoda_id
    }
    return parsed_value
  } else {
    console.warn('unparsed', value)
  }

  return value
}


export default toTransferableNestings
