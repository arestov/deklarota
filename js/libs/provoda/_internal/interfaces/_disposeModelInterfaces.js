const _disposeModelInterfaces = (model) => {
  const all_by_name = model._highway.interfaces_by_name_by_node_id
  if (all_by_name == null) {
    return
  }

  /*
    - iterate over all names (expecting not much names)
    - check _provoda_id/view_id in each
    - call model.useInterface(name, null)
  */

  for (const api_name of all_by_name.keys()) {
    if (!all_by_name.get(api_name).has(model.getInstanceKey())) {
      continue
    }

    model.useInterface(api_name, null)
  }
}

export default _disposeModelInterfaces
