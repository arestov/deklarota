

import { FlowStepUpdateManyAttrs } from '../Model/flowStepHandlers.types'
import getSPByPathTemplateAndData from '../routes/legacy/getSPByPathTemplateAndData'

export default function pushToRoute(md, nesting_name, data) {
  const mentioned = md._nest_rqc[nesting_name]

  if (mentioned.type != 'route') {
    return
  }

  const app = md.app

  const result = getSPByPathTemplateAndData(app, md, mentioned.value, false, data, false, null, data)

  const states = {}

  for (const prop in data) {
    if (!data.hasOwnProperty(prop)) {
      continue
    }
    states[prop] = data[prop]
    const attr_name = '$meta$attrs$' + prop + '$routed'
    if (!hasOwnProperty(md.__default_attrs, attr_name)) {
      continue
    }

    result._attrs_collector.defineAttr(attr_name, 'bool')
    states[attr_name] = true
  }

  md.nextTick(FlowStepUpdateManyAttrs, [states], true)

  return result
}
