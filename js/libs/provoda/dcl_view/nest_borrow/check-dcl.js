
import checkPrefix from '../../AttrsOwner/checkPrefix'
import spv from '../../../spv'
const nil = spv.nil

const parent_count_regexp = /^\^+/gi

const NestBorrowDcl = function(name, data) {
  const full_path = data[0]
  const cutted_nesting_name = full_path.replace(parent_count_regexp, '')
  const parent_count = full_path.length - cutted_nesting_name.length

  this.parent_count = parent_count
  this.name = name
  this.source_nesting_name = cutted_nesting_name
  this.view_constr = data[1]
}

const checkDcl = checkPrefix('nest_borrow-', NestBorrowDcl, '_nest_borrow')

export default function check(self, props) {
  const entries = checkDcl(self, props)

  if (nil(entries)) {return}

  props.children_views = spv.cloneObj({}, props.children_views)
  self.children_views = spv.cloneObj({}, self.children_views)

  for (const name in entries) {
    const cur = entries[name]
    props.children_views[cur.name] = self.children_views[cur.name] = cur.view_constr
  }
}
