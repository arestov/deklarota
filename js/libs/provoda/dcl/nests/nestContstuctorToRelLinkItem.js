import {getResourceInfo, createAddrByPart} from '../../utils/multiPath/parse'


const nestContstuctorToRelLinkItem = (item) => {
  switch (item.type) {
    case 'route': {
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
