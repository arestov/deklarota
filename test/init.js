// app thread;
const requirejs = require('../requirejs-config')

const initApp = requirejs('js/utils/initApp')
const fakeApp = requirejs('test/fakeApp')

const env = {}

// var root_bwlev = initBrowsing(app_model);
module.exports = function init(app_props, init) {
  const App = fakeApp(app_props, init)
  return initApp(App, env)
}
