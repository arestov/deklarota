import cloneObj from '../../spv/cloneObj'

var toTransferableNestings = function(value) {
  if (!value) {
    return value
  }

  if (value && value.each_items) {
      // creating value to pass
    var copy = cloneObj({
      $not_model: true,
    }, value)
    delete copy.each_items
    return copy
  }

  if (value._provoda_id) {
    return value._provoda_id
  } else if (Array.isArray(value)) {

    let parsed_value = new Array(value.length)
    for (var jj = 0; jj < value.length; jj++) {
      parsed_value[jj] = value[jj]._provoda_id
    }
    return parsed_value
  } else {
    console.warn('unparsed', value)
  }

  return value
}


export default toTransferableNestings
