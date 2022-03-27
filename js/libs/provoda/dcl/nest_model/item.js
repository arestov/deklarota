import constr_mention from '../../structure/constr_mention'
import nestModelKey from './nestModelKey'
import relShape from '../nests/relShape'
import nestContstuctorToRelLinkItem from '../nests/nestContstuctorToRelLinkItem'

const nestConstructor = constr_mention.nestConstructor

export default function(name, item, options) {
  const key = nestModelKey(name)
  const nest_constr = nestConstructor(name, item, key)

  const rel_shape = relShape({
    many: Boolean(options && options.many),
    linking: nestContstuctorToRelLinkItem(nest_constr),
    uniq: options?.uniq,
  })

  return {
    ...nest_constr,
    rel_shape,
  }
}
