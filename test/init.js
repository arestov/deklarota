import initApp from 'js/utils/initApp'
import fakeApp from 'test/fakeApp'

import makeSteps from './steps'

const env = {}

export default async function init(app_props, init, busOptions) {
  const App = fakeApp({ zero_map_level: true, ...app_props }, init)
  const inited = await initApp(App, env, undefined, busOptions)
  return {
    ...inited,
    steps: makeSteps(inited.app_model),
  }
}
