

import isBwConnectedView from './isBwConnectedView'

export default function(self) {
  var views = self.getViews()

  for (var jj = 0; jj < views.length; jj++) {
    var cur = views[jj]
    if (isBwConnectedView(cur, 'detailed') || isBwConnectedView(cur, 'main')) {
      return cur
    }
  }
}
