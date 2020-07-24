define(function(require) {
'use strict'
var getParsedPath = require('./getParsedPath')
var executeStringTemplate = require('./executeStringTemplate')

var getSPByPathTemplate = function(app, start_md, string_template, need_constr, md_for_urldata) {
  var parsed_template = getParsedPath(string_template);
  return executeStringTemplate(app, start_md, parsed_template, need_constr, md_for_urldata);
};

return getSPByPathTemplate

})
