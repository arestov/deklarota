
import spv from '../../spv'
import getPropsPrefixChecker from '../utils/getPropsPrefixChecker'
const getUnprefixed = spv.getDeprefixFunc('sel-coll-')
const hasPrefixedProps = getPropsPrefixChecker(getUnprefixed)

const parseCollchSel = spv.memorize(function(str) {
  const parts = str.split('/')
  const model_name = parts[1]
  const parent_space_name = parts[2]
  let prio = 0
  if (model_name) {
    prio += 2
  }
  if (parent_space_name) {
    prio += 1
  }

  let key = ''
  if (model_name) {
    key += model_name
  }
  if (parent_space_name) {
    key += '/' + parent_space_name
  }

  return {
    nesting_name : parts[0],
    model_name: parts[1] || null,
    parent_space_name: parts[2] || null,
    prio: prio,
    key: key
  }
})


export default function(self, props) {
  const need_recalc = hasPrefixedProps(props)
  if (!need_recalc) {
    return
  }

  let prop

  self.dclrs_selectors = {}

  for (prop in self) {
    if (getUnprefixed(prop)) {
      const collch = self[ prop ]
      const selector_string = getUnprefixed(prop)
      //self.dclrs_selectors[selector_string] = collch;
      const selector = parseCollchSel(selector_string)
      if (!self.dclrs_selectors.hasOwnProperty(selector.nesting_name)) {
        self.dclrs_selectors[selector.nesting_name] = {}
      }
      self.dclrs_selectors[selector.nesting_name][selector.key] = collch

      // self.dclrs_selectors[selector.nesting_name].push({
      // 	selector: selector,
      // 	collch: collch
      // });


    }
  }
  return true
}
