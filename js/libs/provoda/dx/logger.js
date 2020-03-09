define(function() {
'use strict'
var logStates = function(owner, dubl) {
  if (!owner._highway.logger) {
    return
  }

  owner._highway.logger.pushStates(owner, dubl);
}

var logNesting = function(owner, collection_name, array, old_value, removed) {
  if (!owner._highway.logger) {
    return
  }
  owner._highway.logger.pushNesting(owner, collection_name, array, old_value, removed);

}

return {
  logStates: logStates,
  logNesting: logNesting,
}
})
