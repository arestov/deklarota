import asMultiPath from '../../utils/NestingSourceDr/asMultiPath'
import emptyArray from '../../emptyArray'
import CompxAttrDecl from '../attrs/comp/item'
import asString from '../../utils/multiPath/asString'
import relShape from '../nests/relShape'

const push = Array.prototype.push

const caclConj = function caclConj(...args) {
  const result = []
  for (var i = 0; i < args.length; i++) {
    const cur = args[i] || emptyArray
    push.apply(result, cur)
  }

  if (!result.length) {
    return emptyArray
  }

  return result
}

var NestCntDeclr = function(name, data) {
  const list = data[1]
  var rel_name = '__/internal/rels//_/' + name
  this.dest_name = name
  this.comp_attr = new CompxAttrDecl(rel_name, [
    list.map(asMultiPath).map(asString),
    caclConj,
  ])

  this.rel_shape = relShape(data[2])

  if (!this.rel_shape) {
    throw new Error('rel_shape is required')
  }

}

export default NestCntDeclr
