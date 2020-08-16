import spv from '../libs/spv'
import AppModel from '../libs/provoda/provoda/AppModel'
import prepare from '../libs/provoda/structure/prepare'


export default function fakeApp(props, init) {
  const initSelf = init || function () {}
  const all = {
    init: initSelf,
  }
  const App = spv.inh(AppModel, all, props)
  return prepare(App)
}
