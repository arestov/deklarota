import cloneObj from '../../spv/cloneObj'

var toTransferableNestings = function(value) {
    if (!value) {
      return value
    }

    var parsed_value

    if (value && value.each_items) {
      // creating value to pass
      var copy = cloneObj({
        $not_model: true,
      }, value)
      delete copy.each_items
      return copy
    }

    if (value._provoda_id) {
      parsed_value = value._provoda_id
    } else if (Array.isArray(value)) {

      parsed_value = new Array(value.length)
      for (var jj = 0; jj < value.length; jj++) {
        parsed_value[jj] = value[jj]._provoda_id
      }
    } else {
      console.warn('unparsed', value)
    }
    if (typeof parsed_value == 'undefined') {
      parsed_value = null
    }

    return parsed_value
}


export default toTransferableNestings
