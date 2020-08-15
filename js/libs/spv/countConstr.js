define(function() {
'use strict'
var constr_id = 0;
return function() {
  return constr_id++
}
})
