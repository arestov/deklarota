define(function() {
'use strict'

return function noopForPass() {
  throw new Error('dont call it')
}
})
