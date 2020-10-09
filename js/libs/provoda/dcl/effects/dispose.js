import disposeSubscribeEffects from './legacy/subscribe/run/dispose'
import { dispose as disposeInterfaces } from './legacy/api/init'

const disposeEffects = function disposeEffects(self) {
  disposeInterfaces(self)
  disposeSubscribeEffects(self)
}

export default disposeEffects
