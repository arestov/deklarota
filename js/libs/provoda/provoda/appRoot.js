
import spvExtend from '../../spv/inh'
import prepare from '../structure/prepare'
import AppModel from './AppModel'

export default function(props, init) {
  if (typeof props == 'function') {
    if (init) {
      throw new Error('you cant pass init with Constr')
    }
    return prepare(props)
  }

  const all = {}
  if (init) {
    all.init = init
  }
  all.skip_code_path = true

  const App = spvExtend(AppModel, all, props)
  return prepare(App)

}
