define(function() {
'use strict'

return function(self, cb) {
  self.on('die', cb);
}
})
