
import spv from '../../../../../spv'
import _updateAttr from '../../../../_internal/_updateAttr'
import wrapDeps from '../api/utils/wrapDeps'
const toRealArray = spv.toRealArray


const getHandler = function(schema) {
  const parse = typeof schema === 'object' && spv.mmap(schema)
  const is_one_field = typeof schema === 'string'

  if (is_one_field) {
    return function(self, result) {
      _updateAttr(self, schema, result)
    }
  }
  return function(self, result) {
    self.updateManyStates(parse(result))
  }
}

export default function ApiEffectDeclr(name, data) {

  this.name = name
  this.apis = null
  this.triggering_states = null
  this.deps = null
  this.deps_name = null
  this.effects_deps = null
  this.fn = null
  this.result_schema = null
  this.is_async = null
  this.result_handler = null

  this.all_deps = null

  if (!Array.isArray(data)) {
    this.apis = toRealArray(data.api)
    this.triggering_states = toRealArray(data.trigger)
    this.fn = data.fn
    this.is_async = data.is_async
    this.result_handler = data.parse && getHandler(this.is_async, data.parse)

    if (data.require) {
      this.deps = wrapDeps(data.require)
      // var desc = '_need_api_effect_' + name
      this.deps_name = Symbol() // || Symbol(desc)

      this.all_deps = this.deps
    }

    if (data.effects) {
      this.effects_deps = (data.effects && toRealArray(data.effects)) || null
    }

    return
  }

  const execution = data[0]
  this.apis = toRealArray(execution[0])
  this.triggering_states = toRealArray(execution[1])
  this.fn = execution[2]
  this.result_schema = execution[3]
  this.is_async = !!execution[4]

  this.result_handler = this.result_schema && getHandler(this.is_async, this.result_schema)

  const condition = data[1]
  const deps = condition && condition[0]
  if (deps) {
    this.deps = wrapDeps(deps)
    // var desc = '_need_api_effect_' + name
    this.deps_name = Symbol() // || Symbol(desc)
    this.all_deps = this.deps
  }
  const effects_deps = condition && condition[1]
  this.effects_deps = (effects_deps && toRealArray(effects_deps)) || null
}
