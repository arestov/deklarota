
import constr_mention from '../../structure/constr_mention'
import nestModelKey from './nestModelKey'

var nestConstructor = constr_mention.nestConstructor

export default function(name, item) {
  var key = nestModelKey(name)
  return nestConstructor(name, item, key)
}
