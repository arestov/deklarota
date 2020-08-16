
import checkPrefix from '../../StatesEmitter/checkPrefix'
import spv from 'spv'
var nil = spv.nil

var parent_count_regexp = /^\^+/gi

var NestBorrowDcl = function(name, data) {
  var full_path = data[0]
  var cutted_nesting_name = full_path.replace(parent_count_regexp, '')
  var parent_count = full_path.length - cutted_nesting_name.length

  this.parent_count = parent_count
  this.name = name
  this.source_nesting_name = cutted_nesting_name
  this.view_constr = data[1]
}

var checkDcl = checkPrefix('nest_borrow-', NestBorrowDcl, '_nest_borrow')

export default function check(self, props) {
  var entries = checkDcl(self, props)

  if (nil(entries)) {return}

  props.children_views = spv.cloneObj({}, props.children_views)
  self.children_views = spv.cloneObj({}, self.children_views)

  for (var name in entries) {
    var cur = entries[name]
    props.children_views[cur.name] = self.children_views[cur.name] = cur.view_constr
  }
}
