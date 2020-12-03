import isExternalAttrAddr from '../../../utils/multiPath/isExternalAttrAddr'
import getRelPathConstrs from '../../nests/getRelPathConstrs'




const getEdgeRels = (Root, self, addr) => {
  if (addr.from_base.type) {
    console.log('noop')
    return
  }

  if (addr.resource && addr.resource.path) {
    console.log('noop')
    return
  }

  const rel_path = getRelPathConstrs(self, addr.nesting.path, true)


}

const reportStaticUsage = (Root, self, attrs) => {
  for (var comp_attr_name in attrs) {
    if (!attrs.hasOwnProperty(comp_attr_name)) {
      continue
    }

    const comp_attr = attrs[comp_attr_name]

    for (var i = 0; i < comp_attr.addrs.length; i++) {
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
