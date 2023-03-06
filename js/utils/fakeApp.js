import AppModel from '../libs/provoda/provoda/AppModel'
import prepare from '../libs/provoda/structure/prepare'
import spvExtend from '../libs/spv/inh'


export default function fakeApp(props, init) {
  const initSelf = init || function noop() {}
  const all = {
    init: initSelf,
  }
  const App = spvExtend(AppModel, all, props)
  return prepare(App)
}
