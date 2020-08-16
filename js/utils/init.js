// app thread;
import fakeApp from './fakeApp'

import initApp from './initApp'

const env = {}

// var root_bwlev = initBrowsing(app_model);

export default function init(app_props, init, interfaces, opts) {
  const App = fakeApp(app_props, init)
  return initApp(App, env, interfaces, opts)
}
