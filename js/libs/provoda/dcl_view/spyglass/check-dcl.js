
import checkPrefix from '../../AttrsOwner/checkPrefix'
import spv from '../../../spv'
const transportName = function(spyglass_name) {
  return 'router__' + spyglass_name.replace('/', '__')
}
const nil = spv.nil

const NestSpyglassDcl = function(name, data) {
  this.name = name

  const View = data[0]

  const params = data[1]
  const context_md = nil(params && params.context_md) ? true : params.context_md
  const bwlev = nil(params && params.bwlev) ? true : params.bwlev

  this.spyglass_view = View
  this.context_md = context_md
  this.bwlev = bwlev

  this.nest_name = transportName(name)
}

const checkNestSpyglasses = checkPrefix('router-', NestSpyglassDcl, '_spyglass')

export default function check(self, props) {
  const spyglasses = checkNestSpyglasses(self, props)

  if (nil(spyglasses)) {return}

  props.children_views = spv.cloneObj({}, props.children_views)
  self.children_views = spv.cloneObj({}, self.children_views)

  for (const name in spyglasses) {
    const cur = spyglasses[name]
    props.children_views[cur.nest_name] = self.children_views[cur.nest_name] = cur.spyglass_view
  }
}
