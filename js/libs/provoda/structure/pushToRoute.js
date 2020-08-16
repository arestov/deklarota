

import getSPByPathTemplateAndData from '../routes/legacy/getSPByPathTemplateAndData'

export default function(md, nesting_name, data) {
  var mentioned = md._nest_rqc[nesting_name]

  if (mentioned.type == 'route') {
    var app = md.app

    var result = getSPByPathTemplateAndData(app, md, mentioned.value, false, data, false, null, data)

    var states = {}

    for (var prop in data) {
      if (!data.hasOwnProperty(prop)) {
        continue
      }
      states[prop] = data[prop]
      var attr_name = '$meta$states$' + prop + '$routed'
      result._attrs_collector.defineAttr(attr_name, 'bool')
      states[attr_name] = true
    }

    md.useMotivator(result, function() {
      result.updateManyStates(states)
    })

    return result
  }
}
