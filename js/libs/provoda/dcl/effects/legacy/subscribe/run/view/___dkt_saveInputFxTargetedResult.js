import { hasOwnProperty } from '../../../../../../hasOwnProperty'
import _updateAttr from '../../../../../../_internal/_updateAttr'

const save = (em, target, value) => {
  _updateAttr(em, target.target_path.state.base, value)
}

export default function ___dkt_saveInputFxTargetedResult(fx, data) {
  const em = this

  if (fx.targeted_single_result) {
    save(em, fx.targeted_single_result, data)
    return
  }

  for (let i = 0; i < fx.targeted_results_list.length; i++) {
    const target = fx.targeted_results_list[i]
    if (!hasOwnProperty(data, target.result_name)) {
      continue
    }

    save(em, target, data[target.result_name])
  }

}
