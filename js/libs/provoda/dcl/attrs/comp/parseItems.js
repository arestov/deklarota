import CompxAttrDecl from './item'

const parseItems = function(self, typed_state_dcls) {
  if (!typed_state_dcls) {
    return
  }

  for (var name in typed_state_dcls) {
    if (!typed_state_dcls.hasOwnProperty(name)) {
      continue
    }
    typed_state_dcls[name] = new CompxAttrDecl(name, typed_state_dcls[name])
  }
}

export default parseItems
