import constr_mention from '../../structure/constr_mention'
import nestModelKey from './nestModelKey'
import relShape from '../nests/relShape'
import nestContstuctorToRelLinkItem from '../nests/nestContstuctorToRelLinkItem'

var nestConstructor = constr_mention.nestConstructor

export default function(name, item, options) {
  var key = nestModelKey(name)
  const nest_constr = nestConstructor(name, item, key)

  const rel_shape = relShape({
    many: Boolean(options && options.many),
    linking: nestContstuctorToRelLinkItem(nest_constr)
  })

  return {
    ...nest_constr,
    rel_shape,
  }
}
