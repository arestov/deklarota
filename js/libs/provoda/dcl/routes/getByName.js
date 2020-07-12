define(function() {
'use strict'
return function(self, sp_name) {
  if (self.__modern_subpages == null) {
    return null
  }
  return self.__modern_subpages[sp_name]
}
})
