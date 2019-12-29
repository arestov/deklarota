define(function(require) {
'use strict';

var initDeclaredNestings = require('../initDeclaredNestings');
var getSPByPathTemplateAndData = initDeclaredNestings.getSPByPathTemplateAndData;

return function(md, nesting_name, data) {
  var mentioned = md._nest_rqc[nesting_name];

  if (mentioned.type == 'route') {
    var app = md.app;
    var result = getSPByPathTemplateAndData(app, md, mentioned.value, false, data);

    md.useMotivator(result, function () {
      result.updateManyStates(data);

      var states = {}
      for (var prop in data) {
        states['$meta$states$' + prop + '$routed'] = true
      }
      result.updateManyStates(states);
    });

    return result;
  }
}

})
