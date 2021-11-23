import checkAndDisposeModel from '../checkAndDisposeModel'

const disposeOneMention = function(owner, target, name) {
  // owner.children_models[name] == target
  const mentions = target.__mentions_as_rel[name]

  if (mentions != null) {
    mentions.delete(owner)
  }

  if (owner == target) {
    return
  }

  if (mentions == null || !mentions.size) {
    checkAndDisposeModel(target, target.getAttr('$meta$removed'))
  }
}

const disposeMentions = function(self) {
  for (const name in self.children_models) {
    if (!self.children_models.hasOwnProperty(name)) {
      continue
    }

    const cur = self.children_models[name]
    if (cur == null) {
      continue
    }

    if (!Array.isArray(cur)) {
      disposeOneMention(self, cur, name)
    } else {
      for (let i = 0; i < cur.length; i++) {
        disposeOneMention(self, cur[i], name)
      }
    }
  }
}

export default disposeMentions
