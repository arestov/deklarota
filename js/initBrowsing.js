define(function(require) {
'use strict';
var BrowseMap = require('./libs/BrowseMap');

return function initBrowsing(app, states) {
  var bwroot = BrowseMap.hookRoot(app, app.start_page, states);
  if (app.legacy_app) {
    app.bwroot = bwroot;
  }
  return bwroot;
};

});
