

import updateNesting from './updateNesting'

export default function gentlyUpdateNesting(self, collection_name, input, opts) {
  if (self == null) {
    console.error(new Error(`Couldn't update "${collection_name}" rel in ${self}.`))
    return undefined
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
