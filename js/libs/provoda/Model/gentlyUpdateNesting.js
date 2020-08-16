

var updateNesting = require('./updateNesting')

export default function gentlyUpdateNesting(self, collection_name, input, opts) {
  if (self._currentMotivator() != null) {
    updateNesting(self, collection_name, input, opts)
    return
  }

  self.input(function() {
    updateNesting(self, collection_name, input, opts)
  })
};
