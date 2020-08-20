
import spv from '../../../../../spv'

export default function assign(typed_state_dcls, nest_declr) {
  typed_state_dcls['comp'] = typed_state_dcls['comp'] || {}
  typed_state_dcls['comp'][nest_declr.state_dep] = [nest_declr.dependencies, spv.hasEveryArgs]
}
