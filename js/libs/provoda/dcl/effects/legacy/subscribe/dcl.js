
import spv from '../../../../../spv'
import targetedResult from '../../../passes/targetedResult/dcl.js'

const warnStateUsing = function() {
  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  console.warn('please use pass_name, not state_name')
}

let count = 0

export default function StateBindDeclr(key, data) {
  this.id = ++count
  this.key = key
  this.apis = null
  this.fn = null
  this.remote = data.remote === true ? true : false

  this.state_name = null
  this.pass_name = null
  this.targeted_result = null

  if (data.to) {
    this.targeted_result = true
    targetedResult(this, data.to)
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
