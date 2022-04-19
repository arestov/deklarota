import {getResourceInfo, createAddrByPart} from '../../utils/multiPath/parse'
import type { RelLink } from './rel.types'



const nestContstuctorToRelLinkItem = (item: {type: 'route', value: string } | {type: 'constr', key: string}): RelLink => {
  switch (item.type) {
    case 'route': {
      if (item.value.startsWith('/')) {
        throw new Error('route should not starts with `/`')
      }
      return {
        type: 'addr',
        value: createAddrByPart({
          resource: getResourceInfo(item.value),
        }),
      }
    }
    case 'constr': {
      return {
        type: 'constr',
        value: item.key,
      }
    }
    default: throw new Error('unknown item type')
  }
}

export default nestContstuctorToRelLinkItem
