
import spv from '../spv'
import Model from './Model'
import getRelFromInitParams from './utils/getRelFromInitParams'

export default function(Constr, states, params, map_parent, app) {
  const BehaviorContr = Constr || Model
  const opts = (app || map_parent) && {
    app: app || map_parent.app,
    map_parent: map_parent
  }

  const model = new BehaviorContr(opts, {
    by: 'utilCreate',
    init_version: 2,
    states: states,
    head: null,
    url_params: null,
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
