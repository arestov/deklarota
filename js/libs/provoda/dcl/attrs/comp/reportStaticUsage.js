import isExternalAttrAddr from '../../../utils/multiPath/isExternalAttrAddr'
import getPrtsByRelPath from '../../nests/getPrtsByRelPath'




const getEdgeRels = (_Root, self, addr) => {
  if (addr.from_base.type) {
    console.log('noop')
    return
  }

  if (addr.resource && addr.resource.path) {
    console.log('noop')
    return
  }

  // will throw errors and warnings
  getPrtsByRelPath(self, addr.nesting.path, true)


}

const reportStaticUsage = (Root, self, attrs) => {

  if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
    return
  }

  for (const comp_attr_name in attrs) {
    if (!attrs.hasOwnProperty(comp_attr_name)) {
      continue
    }

    const comp_attr = attrs[comp_attr_name]

    for (let i = 0; i < comp_attr.addrs.length; i++) {
      const addr = comp_attr.addrs[i]
      if (!isExternalAttrAddr(addr)) {
        continue
      }

      if (!addr.nesting.path) {
        // temp
        continue
      }

      getEdgeRels(Root, self, addr)
    }


    // addr.nesting.path




  }
  // for each user attrs.
    // check rel (full path)
}

export default reportStaticUsage
