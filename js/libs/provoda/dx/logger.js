
var CH_GR_LE = 2

var selectModel = function(owner) {
  var list = owner._highway.logger.selectModels
  if (!list) {
    return true
  }


  for (var i = 0; i < list.length; i++) {
    var cur = list[i]
    if (cur === owner.hierarchy_path) {
      return true
    }
  }

  return false
}

var checkModel = function(owner) {
  if (owner.dx && owner.dx.logging === true) {
    return true
  }

  var fine = selectModel(owner)
  if (!fine) {
    return false
  }

  if (!owner._highway.logger.checkModel) {
    return true
  }

  return owner._highway.logger.checkModel(owner)
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
  for (var i = 0; i < list.length; i += CH_GR_LE) {
    var name = list[i]
    if (!checkState(owner, name)) {
      continue
    }

    var newValue = list[i + 1]

    changes.push([name, newValue])
  }

  if (!changes.length) {
    return
  }

  owner._highway.logger.pushStates(owner, changes)
}

var logNesting = function(owner, collection_name, array, old_value, removed) {
  if (!owner._highway.logger) {
    return
  }

  if (!checkModel(owner)) {
    return
  }

  owner._highway.logger.pushNesting(owner, collection_name, array, old_value, removed)

}

export default {
  logStates: logStates,
  logNesting: logNesting,
}
