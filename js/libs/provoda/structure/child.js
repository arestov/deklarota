
import spv from '../../spv'
import spvExtend from '../../spv/inh'
const prefixValue = function(source) {
  if (!source) {
    return 'unk--'
  }

  const main_part = source[0]
  if (main_part == 'nest') {
    return ''
  }

  return main_part + '--'
}

export default function(name, Constr, source) {
  const Result = spvExtend(Constr, {
    skip_code_path: true
  }, {
    hierarchy_name_source: source || null,
    hierarchy_name: prefixValue(source) + name
  })
  return Result
}
