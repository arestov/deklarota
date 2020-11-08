import shallowEqual from '../shallowEqual'

const assignField = (self, field, value) => {
  if (self[field] === value || shallowEqual(self[field], value)) {return}

  self[field] = value
}

export default assignField
