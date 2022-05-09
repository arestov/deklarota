
import spv from '../spv'
import getRelFromInitParams from './utils/getRelFromInitParams'

export default function(Constr, states, params, map_parent, app = map_parent.app) {
  const BehaviorContr = Constr
  const opts = (app || map_parent) && {
    app: app,
    map_parent: map_parent,
    _provoda_id: app._highway.models_counters++,
  }

  const model = new BehaviorContr(opts, {
    by: 'utilCreate',
    init_version: 2,
    attrs: states,
    rels: getRelFromInitParams(params),
  })

  if (params == null) {
    return model
  }

  if (params.interfaces) {
    spv.forEachKey(params.interfaces, function(intrface, interface_name, model) {
      model.useInterface(interface_name, intrface)
    }, model)
  }

  return model
}
