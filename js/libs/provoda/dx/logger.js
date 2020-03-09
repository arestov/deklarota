define(function() {
'use strict'

var checkModel = function(owner) {
  if (!owner._highway.logger.checkModel && !owner._highway.logger.selectModels) {
    return true
  }

  if (owner.dx && owner.dx.logging === true) {
    return true
  }

  return owner._highway.logger.checkModel && owner._highway.logger.checkModel(owner)
}

var checkState = function(owner, state_name) {
  if (!owner._highway.logger.checkState) {
    return true
  }

  if (!checkModel(owner)) {
    return
  }

  return owner._highway.logger.checkState(state_name, owner)
}

var logStates = function(owner, dubl) {
  if (!owner._highway.logger) {
    return
  }

  if (!checkModel(owner)) {
    return
  }

  var list = dubl
  var changes = []
  for (var i = 0; i < list.length; i += 3) {
    var name = list[i + 1]
    if (!checkState(owner, name)) {
      continue
    }

    var newValue = list[i + 2]

    changes.push([name, newValue])
  }

  if (!changes.length) {
    return
  }

  owner._highway.logger.pushStates(owner, changes);
}

var logNesting = function(owner, collection_name, array, old_value, removed) {
  if (!owner._highway.logger) {
    return
  }

  if (!checkModel(owner)) {
    return
  }

  owner._highway.logger.pushNesting(owner, collection_name, array, old_value, removed);

}

return {
  logStates: logStates,
  logNesting: logNesting,
}
})
