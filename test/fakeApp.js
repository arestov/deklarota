import spv from 'spv'
import AppModel from 'pv/AppModel'
import prepare from 'js/libs/provoda/structure/prepare'

export default function fakeApp(props, init) {
  const initSelf = init || function () {}
  const all = {
    init: initSelf,
  }
  const App = spv.inh(AppModel, all, {
    encodeURLPart: encodeURIComponent,
    decodeURLPart: decodeURIComponent,
    ...props,
  })
  return prepare(App)
}
