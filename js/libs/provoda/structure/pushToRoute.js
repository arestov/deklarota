define(function(require) {
'use strict';

var initDeclaredNestings = require('../initDeclaredNestings');
var getSPByPathTemplateAndData = initDeclaredNestings.getSPByPathTemplateAndData;

return function(md, nesting_name, data) {
  var mentioned = md._nest_rqc[nesting_name];

  if (mentioned.type == 'route') {
    var app = md.app;

    var states = {}

    for (var prop in data) {
      if (!data.hasOwnProperty(prop)) {
        continue
      }
      states[prop] = data[prop]
      states['$meta$states$' + prop + '$routed'] = true
    }

    var result = getSPByPathTemplateAndData(app, md, mentioned.value, false, data, false, null, states);

    md.useMotivator(result, function () {

      result.updateManyStates(states);
    });

    return result;
  }
}

})
