const makeSteps = require('./steps')
const requirejs = require('../requirejs-config')

const initApp = requirejs('js/utils/initApp')
const fakeApp = requirejs('test/fakeApp')

const env = {}

// var root_bwlev = initBrowsing(app_model);
module.exports = async function init(app_props, init) {
  const App = fakeApp(app_props, init)
  const inited = await initApp(App, env)
  return {
    ...inited,
    steps: makeSteps(inited.app_model),
  }
}
