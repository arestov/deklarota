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

  const result = {}

  for (const prop in props) {
    if (!props.hasOwnProperty(prop)) {
      continue
    }
    const cur = props[prop]

    if (!cur) {
      console.warn('implement erasing')
      continue
    }

    const dcl_type = toType(cur[0])

    if (!result[dcl_type]) {
      result[dcl_type] = {}
    }

    const data = sameObjectIfEmpty(cur && cur.slice(1))

    result[dcl_type][prop] = data
  }

  return result
};
