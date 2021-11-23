
const CH_GR_LE = 2

const selectModel = function(owner) {
  const list = owner._highway.logger.selectModels
  if (!list) {
    return true
  }


  for (let i = 0; i < list.length; i++) {
    const cur = list[i]
    if (cur === owner.hierarchy_path) {
      return true
    }
  }

  return false
}

const checkModel = function(owner) {
  if (owner.dx && owner.dx.logging === true) {
    return true
  }

  const fine = selectModel(owner)
  if (!fine) {
    return false
  }

  if (!owner._highway.logger.checkModel) {
    return true
  }

  return owner._highway.logger.checkModel(owner)
}

const checkState = function(owner, state_name) {
  if (!owner._highway.logger.checkState) {
    return true
  }

  if (!checkModel(owner)) {
    return
  }

  return owner._highway.logger.checkState(state_name, owner)
}

const logStates = function(owner, dubl) {
  if (!owner._highway.logger) {
    return
  }

  if (!checkModel(owner)) {
    return
  }

  const list = dubl
  const changes = []
  for (let i = 0; i < list.length; i += CH_GR_LE) {
    const name = list[i]
    if (!checkState(owner, name)) {
      continue
    }

    const newValue = list[i + 1]

    changes.push([name, newValue])
  }

  if (!changes.length) {
    return
  }

  owner._highway.logger.pushStates(owner, changes)
}

const logNesting = function(owner, collection_name, array, old_value, removed) {
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
