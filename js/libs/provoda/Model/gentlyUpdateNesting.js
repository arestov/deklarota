import updateNesting from './updateNesting'

const hasDot = function(nesting_name) {
  return nesting_name.indexOf('.') != -1
}

export default function gentlyUpdateNesting(self, collection_name, input, opts) {
  if (self == null) {
    console.error(new Error(`Couldn't update "${collection_name}" rel in ${self}.`))
    return undefined
  }

  if (hasDot(collection_name)) {
    throw new Error('remove "." (dot) from name')
  }

  if (self.wasDisposed()) {
    return null
  }

  if (self._currentMotivator() != null) {
    updateNesting(self, collection_name, input, opts)
    return
  }

  self.input(function() {
    updateNesting(self, collection_name, input, opts)
  })
}
