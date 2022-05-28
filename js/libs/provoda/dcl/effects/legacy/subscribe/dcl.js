
import spv from '../../../../../spv'
import isJustAttrAddr from '../../../../utils/multiPath/isJustAttrAddr'
import targetedResult from '../../../passes/targetedResult/dcl.js'

const warnStateUsing = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  console.warn('please use pass_name or `to`, not state_name')
}

function validateTargetForView(fx) {
  if (isJustAttrAddr(fx.target_path)) {
    return
  }
  console.warn(fx)
  throw new Error('target section (`to`) of effect inside view should not be more complext that attr addr')
}

function validateEffectForView(fx) {
  if (!fx.targeted_result) {
    return
  }

  if (fx.targeted_single_result) {
    validateTargetForView(fx.targeted_single_result)
    return
  }

  for (let i = 0; i < fx.targeted_results_list.length; i++) {
    const cur = fx.targeted_results_list[i]
    validateTargetForView(cur)
  }
}

let count = 0

export default function StateBindDeclr(key, data, __isView) {
  this.id = ++count
  this.key = key
  this.apis = null
  this.fn = null
  this.remote_action = Boolean(__isView)

  this.state_name = null
  this.pass_name = null
  this.targeted_result = null

  if (data.to) {
    this.targeted_result = true
    targetedResult(this, data.to)
    if (__isView) {
      validateEffectForView(this)
    }
  } else if (!data.state_name && !data.pass_name) {
    this.pass_name = key
  } else if (data.pass_name) {
    this.pass_name = data.pass_name
  } if (data.state_name) {
    warnStateUsing()

    // consider to use targetedResult(this, [data.state_name]) and remove getStateUpdater from makeBindChanges
    this.state_name = data.state_name
  }

  if (Array.isArray(data)) {
    // legacy ?
    this.apis = spv.toRealArray(data[0])
    this.fn = data[1]
    return
  }

  this.apis = spv.toRealArray(data.api)

  // TODO: validate that presented apis_as_input is subset of this.apis
  this.apis_as_input = data.apis_as_input == null ? null : data.apis_as_input
  this.fn = data.fn
}
