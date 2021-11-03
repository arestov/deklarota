import getRelShape from './getRelShape'
import { getRelConstrByRelLinking } from './getRelPathConstrs'
import isGlueRel from '../../Model/mentions/isGlueRel'

const throwError = (msg, self, context) => {
  const err = new Error(msg)
  console.error(err, '\n', context, '\n', self.__code_path)
  throw err
}

const matchConstuctors = (constrs, value_item) => {
  if (!Array.isArray(constrs)) {
    return value_item.constructor === constrs
  }

  for (var i = 0; i < constrs.length; i++) {
    if (value_item.constructor === constrs[i]) {
      return true
    }
  }

  return false
}

const validateValueConstr = (self, rel_name, rel_shape, constrs, value_item) => {
  if (matchConstuctors(constrs, value_item)) {
    return
  }

  throwError('rel_shape constructors does not match value', self, {rel_name, rel_shape, constrs, value_item})
}

const validateConstr = (self, rel_name, rel_shape, value) => {
  // TODO: move constr presence validation to build step
  if (rel_shape.any) { return }

  const constrs = getRelConstrByRelLinking(self, rel_shape.constr_linking)
  if (!constrs) {
    throwError('invalid rel_shape', self, {rel_name})
  }

  if (value == null) {return}

  if (!rel_shape.many) {
    validateValueConstr(self, rel_name, rel_shape, constrs, value)
    return
  }

  for (var i = 0; i < value.length; i++) {
    validateValueConstr(self, rel_name, rel_shape, constrs, value[i])
  }
}

const validateManyValue = (self, rel_name, rel_shape, value) => {
  if (value == null) {return}

  if (rel_shape.many) {
    if (!Array.isArray(value)) {
      throwError('expected list of items. match rel_shape.many param with value', self, {rel_name})
    }
  } else {
    if (Array.isArray(value)) {
      throwError('expected one item. match rel_shape.many param with value', self, {rel_name})
    }
  }
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

  // 2. check if value match "many" param of schema
  validateManyValue(self, rel_name, rel_shape, value)

  // 3.1 ensure we can get constr
  // 3.2 check if value is instance of allowed Constr?
  validateConstr(self, rel_name, rel_shape, value)
}

export default validateRuntimeValue
