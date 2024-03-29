import initApp from 'js/utils/initApp'
import fakeApp from 'test/fakeApp'

import makeSteps from './steps'

const env = {}

export default async function init(app_props, init, busOptions, interfaces) {
  const App = fakeApp({ ...app_props }, init)
  const inited = await initApp(App, env, interfaces, busOptions)
  return {
    ...inited,
    steps: makeSteps(inited.app_model),
  }
}
