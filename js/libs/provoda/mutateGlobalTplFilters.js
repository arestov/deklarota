define(function(require) {
'use strict'
var angbo = require('angbo');
// angbo should be passed to App View Root as interface.
// but we using singleton instance and mutating it
// TODO: don't require angbo, but pass to App View Root

return function(fn) {
  angbo.getFilterFn = fn;
}

})
