import emptyArray from '../../emptyArray'
import multiPathAsString from '../../utils/multiPath/asString'
import supportedAttrTargetAddr from './supportedAttrTargetAddr'

export const $attrs$as_external_target = [
  ['__attrs_uniq_external_deps'],
  (__attrs_uniq_external_deps) => {
    const result = __attrs_uniq_external_deps.filter(supportedAttrTargetAddr)
    if (!result.length) {
      return null
    }
    return result
  }
]

const defaultValue = (addr) => {
  // most of addrs is rels (all of them?)
  switch (addr.zip_name) {
    case 'all':
    case 'filter':
      return emptyArray
  }

  return null
}

export const $attrs$as_external_target$expected_input = [
  ['$attrs$as_external_target'],
  (list) => {
    const result = {}

    for (let i = 0; i < list.length; i++) {
      const cur = list[i]
      result[multiPathAsString(cur)] = defaultValue(cur)
    }

    return result
  }
]
