
import spv from '../../../spv'
import getPropsPrefixChecker from '../../utils/getPropsPrefixChecker'
import depricateItem from '../depricateItem'

const Item = depricateItem('use rels.nest')

const getUnprefixed = spv.getDeprefixFunc('nest-')
const hasPrefixedProps = getPropsPrefixChecker(getUnprefixed)

export default function(self, props) {
  const
    has_props = hasPrefixedProps(props)
  const has_pack = self.hasOwnProperty('nest')
  let prop
  let real_name

  if (!has_props && !has_pack) {
    return
  }

  const result = {}

  const used_props = {}

  if (has_props) {
    for (prop in self) {

      if (getUnprefixed(prop)) {

        real_name = getUnprefixed(prop)
        var cur = self[prop]

        used_props[real_name] = true
        result[real_name] = cur ? new Item(real_name, cur) : null
      }
    }
  }

  if (has_pack) {
    for (real_name in self.nest) {
      if (used_props[real_name]) {
        continue
      }
      var cur = self.nest[real_name]
      used_props[real_name] = true
      result[real_name] = new Item(real_name, cur)
    }
  }
  self._legacy_nest_dcl = result
}
