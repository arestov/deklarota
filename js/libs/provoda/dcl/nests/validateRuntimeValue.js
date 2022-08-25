import getRelShape from './getRelShape'
import { getRelConstrByRelLinking } from './getPrtsByRelPath'
import isGlueRel from '../../Model/mentions/isGlueRel'

const matchConstuctors = (prts, value_item) => {
  if (!Array.isArray(prts)) {
    return value_item.constructor === prts.constructor
  }

  for (let i = 0; i < prts.length; i++) {
    if (value_item.constructor === prts[i].constructor) {
      return true
    }
  }

  return false
}

const validateValueConstr = (self, rel_name, rel_shape, prts, value_item) => {
  if (matchConstuctors(prts, value_item)) {
    return
  }

  const list = Array.isArray(prts) ? prts : [prts]

  self._throwError('rel_shape constructors does not match value', {
    rel_name,
    rel_shape,
    model_names: list.map(item => item.model_name),
    model_define: list.map(item => item.__code_path),
    value_model_name: value_item.model_name,
    value_model_define: value_item.__code_path,
  })
}

const validateConstr = (self, rel_name, rel_shape, value) => {
  // TODO: move constr presence validation to build step
  if (rel_shape.any) { return }

  const prts = getRelConstrByRelLinking(self, rel_shape.constr_linking)
  if (!prts) {
    self._throwError('invalid rel_shape', {rel_name})
  }

  if (value == null) {return}

  if (!rel_shape.many) {
    validateValueConstr(self, rel_name, rel_shape, prts, value)
    return
  }

  for (let i = 0; i < value.length; i++) {
    validateValueConstr(self, rel_name, rel_shape, prts, value[i])
  }
}

const validateManyValue = (self, rel_name, rel_shape, value) => {
  if (value == null) {return}

  if (rel_shape.many) {
    if (!Array.isArray(value)) {
      self._throwError('expected list of items. match rel_shape.many param with value', {rel_name})
    }
  } else {
    if (Array.isArray(value)) {
      self._throwError('expected one item. match rel_shape.many param with value', {rel_name})
    }
  }
}

const validateRuntimeValue = (self, rel_name, value) => {

  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const element = value[i]
      if (element.dead) {
        element._warnError('used dead model!', {rel_name, insideOf: self._provoda_id})
      }
    }

  } else if (value) {
    if (value.dead) {
      value._warnError('used dead model!', {rel_name, insideOf: self._provoda_id})
    }
  }

  if (isGlueRel(self, rel_name)) {
    return
  }

  // 1. check if rel_name allowed (defined)
  const rel_shape = getRelShape(self, rel_name)
  if (!rel_shape) {
    self._throwError('unexpected change of rel. use rels.input', {rel_name})
  }

  // 2. check if value match "many" param of schema
  validateManyValue(self, rel_name, rel_shape, value)

  // 3.1 ensure we can get constr
  // 3.2 check if value is instance of allowed Constr?
  validateConstr(self, rel_name, rel_shape, value)
}

export default validateRuntimeValue
