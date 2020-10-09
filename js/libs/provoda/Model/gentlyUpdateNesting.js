

import updateNesting from './updateNesting'

export default function gentlyUpdateNesting(self, collection_name, input, opts) {
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
