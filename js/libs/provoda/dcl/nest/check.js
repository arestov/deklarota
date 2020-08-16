
import spv from 'spv'
import getPropsPrefixChecker from '../../utils/getPropsPrefixChecker'
var getUnprefixed = spv.getDeprefixFunc('nest-')
var hasPrefixedProps = getPropsPrefixChecker(getUnprefixed)
import NestDcl from './item'

export default function(self, props) {
  var
    has_props = hasPrefixedProps(props),
    has_pack = self.hasOwnProperty('nest'),
    prop, real_name

  if (!has_props && !has_pack) {
    return
  }

  var result = {}

  var used_props = {}

  if (has_props) {
    for (prop in self) {

      if (getUnprefixed(prop)) {

        real_name = getUnprefixed(prop)
        var cur = self[prop]

        used_props[real_name] = true
        result[real_name] = cur ? new NestDcl(real_name, cur) : null
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
      result[real_name] = new NestDcl(real_name, cur)
    }
  }
  self._legacy_nest_dcl = result
}
