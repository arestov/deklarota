import sameObjectIfEmpty from '../utils/sameObjectIfEmpty'

const toType = (type, data) => {
  if (type === 'compx') {
    console.error(new Error('use "comp"'), data)
    return 'comp'
  }

  return type
}

export default function getTypedDcls(props) {
  if (!props) {
    return
  }

  var result = {}

  for (var prop in props) {
    if (!props.hasOwnProperty(prop)) {
      continue
    }
    var cur = props[prop]

    if (!cur) {
      console.warn('implement erasing')
      continue
    }

    var dcl_type = toType(cur[0])

    if (!result[dcl_type]) {
      result[dcl_type] = {}
    }

    var data = sameObjectIfEmpty(cur && cur.slice(1))

    result[dcl_type][prop] = data
  }

  return result
};
