import relShape from '../nests/relShape'
import nestContstuctorToRelLinkItem from '../nests/nestContstuctorToRelLinkItem'

import constr_mention from '../../structure/constr_mention'
var declarationConstructor = constr_mention.declarationConstructor

const subPagesToRelShapeLinks = (list) => {
  if (!Array.isArray(list)) {
    return nestContstuctorToRelLinkItem(list)
  }

  return list.map(nestContstuctorToRelLinkItem)
}

var NestDcl = function(name, data) {
  this.nesting_name = name
  this.subpages_names_list = declarationConstructor(name, data[0], 'nest-')

  this.ask_for = null
  this.idle_until = null
  this.preload_on = null


  this.rel_shape = relShape({
    many: Array.isArray(this.subpages_names_list),
    linking: subPagesToRelShapeLinks(this.subpages_names_list)
  })

  if (!data[1] && !data[2]) {
    return
  }

  if (data[1] && typeof data[1] == 'object' && (!data[2] || typeof data[2] == 'object')) {
    this.ask_for = data[1].ask_for || null
    this.idle_until = data[1].idle_until || this.ask_for || null
    this.preload_on = data[1].preload_on || null
  } else {
    console.warn('fix legacy `nest-` dcl', data[1], data[2])
    var preload = data[1]
    this.preload_on = (preload === true ? 'mp_has_focus' : preload) || null
    this.idle_until = data[2] || null
  }
  /*
  ask_for
  idle_until
  load_on
  */
}

export default NestDcl
