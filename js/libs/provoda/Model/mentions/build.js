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

