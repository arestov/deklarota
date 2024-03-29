
import spvExtend from '../../spv/inh'
import LoadableList from './LoadableList'

export default function behavior(declr, declr_extend_from, named) {
  const behaviorFrom = declr.extends || declr_extend_from || LoadableList
  if (declr.extends && declr_extend_from) {
    throw new Error('choose one: `extends` param or Model arg')
  }

  if (declr.extends) {
    declr = { ...declr }
    delete declr.extends
  }

  if (typeof named == 'object' || !declr.init) {
    return spvExtend(behaviorFrom, {
      naming: named && named.naming,
      init: named && named.init,
      props: declr
    })
  }
  const func = named || function() {}
  behaviorFrom.extendTo(func, declr)
  return func
}
