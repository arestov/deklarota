const getRelDcl = (self, rel_name) => {
  const storage = self._extendable_nest_index
  return storage && storage[rel_name] && storage[rel_name].dcl
}

const getRelShape = (self, rel_name) => {
  const dcl = getRelDcl(self, rel_name)
  return dcl && dcl.rel_shape
}

export default getRelShape
