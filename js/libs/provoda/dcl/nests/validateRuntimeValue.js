import getRelShape from './getRelShape'
import { getRelByConstrByLinking } from './getRelConstr'
import isGlueRel from '../../Model/mentions/isGlueRel'

const throwError = (msg, self, context) => {
  const err = new Error(msg)
  console.error(err, '\n', context, '\n', self.__code_path)
  throw err
}

const validateRuntimeValue = (self, rel_name, value) => {
  if (isGlueRel(self, rel_name)) {
    return
  }

  // 1. check if rel_name allowed (defined)
  const rel_shape = getRelShape(self, rel_name)
  if (!rel_shape) {
    throwError('unexpected change of rel. use rels.input', self, {rel_name})
  }

  // 1.1 ensure we can get constr
  // TODO: move validation to build step
  const Constr = getRelByConstrByLinking(self, rel_shape.constr_linking)
  if (!Constr) {
    throwError('invalid rel_shape', self, {rel_name})
  }

  if (value == null) {return}

  // 2. check if value match "many" param of schema
  if (rel_shape.many) {
    if (!Array.isArray(value)) {
      throwError('expected list of items. match rel_shape.many param with value', self, {rel_name})
    }
  } else {
    if (Array.isArray(value)) {
      throwError('expected one item. match rel_shape.many param with value', self, {rel_name})
    }
  }

  // 3. check if value is instance of allowed Constr?
}

export default validateRuntimeValue
