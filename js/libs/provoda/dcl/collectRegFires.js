
import spv from '../../spv'
import getPropsPrefixChecker from '../utils/getPropsPrefixChecker'
const getUnprefixed = spv.getDeprefixFunc('regfr-', true)
const hasPrefixedProps = getPropsPrefixChecker(getUnprefixed)


export default function(self, props) {
  if (!hasPrefixedProps(props)) {
    return
  }
  let prop

  self.reg_fires = {
    by_namespace: null,
    by_test: null,
    cache: null
  }
  for (prop in self) {

    if (!getUnprefixed(prop)) {
      continue
    }

    const cur = self[prop]
    if (cur.event_name) {
      if (!self.reg_fires.by_namespace) {
        self.reg_fires.by_namespace = {}
      }
      self.reg_fires.by_namespace[cur.event_name] = cur
    } else if (cur.test) {
      if (!self.reg_fires.by_test) {
        self.reg_fires.by_test = []
      }
      self.reg_fires.by_test.push(cur)
    }
  }
}
