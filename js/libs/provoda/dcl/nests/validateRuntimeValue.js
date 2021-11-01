import getRelShape from './getRelShape'
import isGlueRel from '../../Model/mentions/isGlueRel'

const validateRuntimeValue = (self, rel_name, value) => {
  if (isGlueRel(self, rel_name)) {
    return
  }

  // 1. check if rel_name allowed (defined)
  const rel_shape = getRelShape(self, rel_name)
  if (!rel_shape) {
    const err = new Error('unexpected change of rel. use rels.input')
    console.error(err, '\n', {rel_name}, '\n', self.__code_path)
    throw err
  }

  // 1.1 ensure we can get constr?

  if (value == null) {return}

  // 2. check if value match "many" param of schema
  if (rel_shape.many) {
    if (!Array.isArray(value)) {
      const err = new Error('expected list of items. match rel_shape.many param with value')
      console.error(err, '\n', {rel_name}, '\n', self.__code_path)
      throw err

    }
  } else {
    if (Array.isArray(value)) {
      const err = new Error('expected one item. match rel_shape.many param with value')
      console.error(err, '\n', {rel_name}, '\n', self.__code_path)
      throw err

    }
  }

  // 3. check if value is instace of allowed Constr
}

export default validateRuntimeValue
