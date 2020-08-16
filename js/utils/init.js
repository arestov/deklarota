// app thread;
const fakeApp = require('./fakeApp')
const initApp = require('./initApp')

const env = {}

// var root_bwlev = initBrowsing(app_model);

export default function init(app_props, init, interfaces, opts) {
  const App = fakeApp(app_props, init)
  return initApp(App, env, interfaces, opts)
}
