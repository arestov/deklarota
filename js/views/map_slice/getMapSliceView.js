

import isBwConnectedView from './isBwConnectedView'

export default function(self) {
  const views = self.getViews()

  for (let jj = 0; jj < views.length; jj++) {
    const cur = views[jj]
    if (isBwConnectedView(cur, 'detailed') || isBwConnectedView(cur, 'main')) {
      return cur
    }
  }
}
