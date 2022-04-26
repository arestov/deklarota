
import { hasEveryArgs } from '../../../../../spv'

export default function assign(extended_comp_attrs, nest_declr) {
  extended_comp_attrs[nest_declr.state_dep] = [nest_declr.dependencies, hasEveryArgs]
}
